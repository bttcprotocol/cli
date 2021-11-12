import Listr from 'listr'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'

import { printDependencyInstructions, getDefaultBranch } from '../helper'
import { loadConfig } from '../config'

import { Genesis } from '../genesis'
import { Delivery } from '../delivery'
//import { Ganache } from '../ganache'
import { Bttc } from '../bttc'
import { processTemplateFiles } from '../../lib/utils'

async function setupLocalnet(config) {
  //const ganache = new Ganache(config, { contractsBranch: config.contractsBranch })
  const bttc = new Bttc(config, { repositoryBranch: config.bttcBranch })
  const delivery = new Delivery(config, { repositoryBranch: config.deliveryBranch })
  const genesis = new Genesis(config, { repositoryBranch: 'master' })

  const tasks = new Listr(
    [
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
      },
      {
        title: genesis.taskTitle,
        task: () => {
          return genesis.getTasks()
        }
      },
      {
        title: bttc.taskTitle,
        task: () => {
          return bttc.getTasks()
        }
      },
      {
        title: 'Process scripts',
        task: async () => {
          const templateDir = path.resolve(
            new URL(import.meta.url).pathname,
            '../templates'
          )

          // copy all templates to target directory
          await fs.copy(templateDir, config.targetDirectory)

          // process all njk templates
          await processTemplateFiles(config.targetDirectory, { obj: this })
        }
      }
    ],
    {
      exitOnError: true
    }
  )

  await tasks.run()
  console.log('%s Localnet ready', chalk.green.bold('DONE'))

  // print details
  await config.print()

  await genesis.print()
  await delivery.print()
  await bttc.print()
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
  await setupLocalnet(config)
}
