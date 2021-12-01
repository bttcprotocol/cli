import Listr from 'listr'
import execa from 'execa'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'
import os from 'os'

import fileReplacer from '../../lib/file-replacer'
import { loadConfig } from '../config'
import { cloneRepository, privateKeyToPublicKey, compressedPublicKey, processTemplateFiles } from '../../lib/utils'
import { printDependencyInstructions, getDefaultBranch } from '../helper'
//import { Ganache } from '../ganache'

// repository name
export const REPOSITORY_NAME = 'delivery'
export const DELIVERY_HOME = '.deliveryd'

export function getValidatorKeyPath() {
  return path.join(os.homedir(), DELIVERY_HOME, 'config/priv_validator_key.json')
}

export class Delivery {
  constructor(config, options = {}) {
    this.config = config

    this.repositoryName = this.name
    this.repositoryBranch = options.repositoryBranch || 'master'
    this.repositoryUrl = options.repositoryUrl || 'https://github.com/bttcprotocol/delivery.git'
  }

  get name() {
    return 'delivery'
  }

  get taskTitle() {
    return 'Setup delivery'
  }

  get validatorKeyFile() {
    return 'priv_validator_key.json'
  }

  get configValidatorKeyFilePath() {
    return path.join(this.config.configDir, this.validatorKeyFile)
  }

  get repositoryDir() {
    return path.join(this.config.codeDir, this.repositoryName)
  }

  get buildDir() {
    return path.join(this.repositoryDir, 'build')
  }

  get deliverydCmd() {
    return path.join(this.buildDir, 'deliveryd')
  }

  get deliverydCli() {
    return path.join(this.buildDir, 'deliverycli')
  }
  get deliveryDataDir() {
    return path.join(this.config.dataDir, this.name)
  }

  get deliveryConfigDir() {
    return path.join(this.deliveryDataDir, 'config')
  }

  get deliveryGenesisFilePath() {
    return path.join(this.deliveryConfigDir, 'genesis.json')
  }

  get deliveryDeliveryConfigFilePath() {
    return path.join(this.deliveryConfigDir, 'delivery-config.toml')
  }

  get deliveryConfigFilePath() {
    return path.join(this.deliveryConfigDir, 'config.toml')
  }

  get deliveryValidatorKeyFilePath() {
    return path.join(this.deliveryConfigDir, this.validatorKeyFile)
  }

  async print() {
    // print details
    console.log(chalk.gray('Delivery home') + ': ' + chalk.bold.green(this.deliveryDataDir))
    console.log(chalk.gray('Delivery genesis') + ': ' + chalk.bold.green(this.deliveryGenesisFilePath))
    console.log(chalk.gray('Delivery validator key') + ': ' + chalk.bold.green(this.deliveryValidatorKeyFilePath))
    console.log(chalk.gray('Delivery repo') + ': ' + chalk.bold.green(this.repositoryDir))
    console.log(chalk.gray('Setup delivery') + ': ' + chalk.bold.green('bash delivery-start.sh'))
    console.log(chalk.gray('Start delivery rest-server') + ': ' + chalk.bold.green('bash delivery-server-start.sh'))
    console.log(chalk.gray('Start delivery bridge') + ': ' + chalk.bold.green('bash delivery-bridge-start.sh'))
    console.log(chalk.gray('Reset delivery') + ': ' + chalk.bold.green('bash delivery-clean.sh'))
  }

  async account() {
    return execa(this.deliverydCmd, ['show-account', '--home', this.deliveryDataDir], {
      cwd: this.config.targetDirectory
    }).then(output => {
      return JSON.parse(output.stdout)
    })
  }

  // returns delivery private key details
  async accountPrivateKey() {
    return execa(this.deliverydCmd, ['show-privatekey', '--home', this.deliveryDataDir], {
      cwd: this.config.targetDirectory
    }).then(output => {
      return JSON.parse(output.stdout).priv_key
    })
  }

  // returns content of validator key
  async generateValidatorKey() {
    return execa(this.deliverydCli, ['generate-validatorkey', this.config.primaryAccount.privateKey, '--home', this.deliveryDataDir], {
      cwd: this.config.configDir
    }).then(() => {
      return require(this.configValidatorKeyFilePath)
    })
  }

  async getProcessGenesisFileTasks() {
    return new Listr([
      {
        title: 'Process Delivery and Bttc chain ids',
        task: () => {
          fileReplacer(this.deliveryGenesisFilePath)
            .replace(/"chain_id":[ ]*".*"/gi, `"chain_id": "${this.config.deliveryChainId}"`)
            .replace(/"bor_chain_id":[ ]*".*"/gi, `"bor_chain_id": "${this.config.bttcChainId}"`)
            .save()
        }
      },
      {
        title: 'Process validators',
        task: () => {
          fileReplacer(this.deliveryGenesisFilePath)
            .replace(/"address":[ ]*".*"/gi, `"address": "${this.config.primaryAccount.address}"`)
            .replace(/"signer":[ ]*".*"/gi, `"signer": "${this.config.primaryAccount.address}"`)
            .replace(/"pubKey":[ ]*".*"/gi, `"pubKey": "${privateKeyToPublicKey(this.config.primaryAccount.privateKey).replace('0x', '0x04')}"`)
            .replace(/"power":[ ]*".*"/gi, `"power": "${this.config.defaultStake}"`)
            //.replace(/"user":[ ]*".*"/gi, `"user": "${this.config.primaryAccount.address}"`)
            .save()
        }
      },
      {
        title: 'Process contract addresses',
        task: () => {
          // get root contracts
          const rootContracts = this.config.contractAddresses.root

          fileReplacer(this.deliveryGenesisFilePath)
            .replace(/"matic_token_address":[ ]*".*"/gi, `"matic_token_address": "${rootContracts.tokens.TestToken}"`)
            .replace(/"staking_manager_address":[ ]*".*"/gi, `"staking_manager_address": "${rootContracts.StakeManagerProxy}"`)
            .replace(/"root_chain_address":[ ]*".*"/gi, `"root_chain_address": "${rootContracts.RootChainProxy}"`)
            .replace(/"staking_info_address":[ ]*".*"/gi, `"staking_info_address": "${rootContracts.StakingInfo}"`)
            .replace(/"state_sender_address":[ ]*".*"/gi, `"state_sender_address": "${rootContracts.StateSender}"`)
            .save()
        },
        enabled: () => {
          return this.config.contractAddresses
        }
      }
    ], {
      exitOnError: true
    })
  }

  cloneRepositoryTask() {
    return {
      title: 'Clone Delivery repository',
      task: () => cloneRepository(this.repositoryName, this.repositoryBranch, this.repositoryUrl, this.config.codeDir)
    }
  }

  buildTask() {
    return {
      title: 'Build Delivery',
      task: () => execa('make', ['build'], {
        cwd: this.repositoryDir
      })
    }
  }

  async getTasks() {
    return new Listr(
      [
        this.cloneRepositoryTask(),
        this.buildTask(),
        {
          title: 'Init Delivery',
          task: () => {
            return execa(this.deliverydCmd, ['init', '--home', this.deliveryDataDir, '--chain-id', this.deliveryChainId], {
              cwd: this.repositoryDir
            })
          }
        },
        {
          title: 'Create Delivery account from private key',
          task: () => {
            // It generates new account for validator
            // and replaces it with new validator key
            return this.generateValidatorKey().then(data => {
              return fs.writeFile(this.deliveryValidatorKeyFilePath, JSON.stringify(data, null, 2), { mode: 0o755 })
            })
          }
        },
        {
          title: 'Process genesis file',
          task: () => {
            return this.getProcessGenesisFileTasks()
          }
        },
        {
          title: 'Process Delivery config file',
          task: () => {
            fileReplacer(this.deliveryDeliveryConfigFilePath)
              .replace(/eth_rpc_url[ ]*=[ ]*".*"/gi, 'eth_rpc_url = "http://localhost:9545"')
              .replace(/bttc_rpc_url[ ]*=[ ]*".*"/gi, 'bttc_rpc_url = "http://localhost:8545"')
              .save()
          }
        },
        {
          title: 'Copy template scripts',
          task: async () => {
            const templateDir = path.resolve(
              new URL(import.meta.url).pathname,
              '../templates'
            )

            // copy all templates to target directory
            await fs.copy(templateDir, this.config.targetDirectory)

            // process all njk templates
            await processTemplateFiles(this.config.targetDirectory, { obj: this })
          }
        }
      ],
      {
        exitOnError: true
      }
    )
  }
}

async function setupDelivery(config) {
  //const ganache = new Ganache(config, { contractsBranch: config.contractsBranch })
  const delivery = new Delivery(config, { repositoryBranch: config.deliveryBranch })

  // get all delivery related tasks
  const tasks = new Listr([
    // {
    //   title: ganache.taskTitle,
    //   task: () => {
    //     return ganache.getTasks()
    //   }
    // },
    {
      title: delivery.taskTitle,
      task: () => {
        return delivery.getTasks()
      }
    }
  ], {
    exitOnError: true
  })

  await tasks.run()
  console.log('%s delivery is ready', chalk.green.bold('DONE'))

  // print details
  await config.print()
  //await ganache.print()
  await delivery.print()

  return true
}

export default async function () {
  await printDependencyInstructions()

  // configuration
  const config = await loadConfig()
  await config.loadChainIds()
  await config.loadAccounts()

  // load branch
  const answers = await getDefaultBranch(config)
  config.set(answers)

  // start setup
  await setupDelivery(config)
}
