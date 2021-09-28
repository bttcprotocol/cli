import path from 'path'
import execa from 'execa'
import fs from 'fs-extra'
import { projectInstall } from 'pkg-install'

import { cloneRepository } from '../../lib/utils'

export class Contracts {
  constructor(config, options = {}) {
    this.config = config

    this.repositoryName = 'contracts'
    this.repositoryBranch = options.repositoryBranch || 'stake'
    this.repositoryUrl = options.repositoryUrl || 'http://39.106.174.213/BitTorrentChain/contracts.git'
  }

  get name() {
    return this.repositoryName
  }

  get taskTitle() {
    return 'Setup contracts'
  }

  get repositoryDir() {
    return path.join(this.config.codeDir, this.repositoryName)
  }

  get localContractAddressesPath() {
    return path.join(this.repositoryDir, 'contractAddresses.json')
  }

  get contractAddressesPath() {
    return path.join(this.config.configDir, 'contractAddresses.json')
  }

  get contractAddresses() {
    return require(this.contractAddressesPath)
  }

  print() { }

  cloneRepositoryTasks() {
    return [
      {
        title: 'Clone matic contracts repository',
        task: () => cloneRepository(this.repositoryName, this.repositoryBranch, this.repositoryUrl, this.config.codeDir)
      }
    ]
  }

  compileTasks() {
    return [
      {
        title: 'Install dependencies for matic contracts',
        task: () => projectInstall({
          cwd: this.repositoryDir
        })
      },
      {
        title: 'Process templates',
        task: () => execa('npm', ['run', 'template:process', '--', '--bor-chain-id', this.config.borChainId], {
          cwd: this.repositoryDir
        })
      },
      {
        title: 'Compile matic contracts',
        task: () => execa('npm', ['run', 'truffle:compile'], {
          cwd: this.repositoryDir
        })
      }
    ]
  }

  prepareContractAddressesTasks() {
    return [
      {
        title: 'Prepare contract addresses',
        task: async () => {
          // copy local contract address json file to config folder
          if (fs.existsSync(this.localContractAddressesPath)) {
            await execa('cp', [this.localContractAddressesPath, this.contractAddressesPath])
          }
        }
      },
      {
        title: 'Load contract addresses',
        task: () => {
          this.config.contractAddresses = this.contractAddresses
        }
      }
    ]
  }

  async getTasks() { }
}
