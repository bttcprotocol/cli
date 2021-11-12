import { Command } from 'commander'

import delivery from './delivery'
import genesis from './genesis'
import bttc from './bttc'
import localnet from './localnet'
//import ganache from './ganache'
import devnet from './devnet'

//
// Add sub commands
//
const deliveryCmd = new Command('delivery')
deliveryCmd.action(delivery)

const genesisCmd = new Command('genesis')
genesisCmd.action(genesis)

const bttcCmd = new Command('bttc')
bttcCmd.action(bttc)

// const ganacheCmd = new Command('ganache')
// ganacheCmd.action(ganache)

const localnetCmd = new Command('localnet')
localnetCmd.action(localnet)

const devnetCmd = new Command('devnet')
devnetCmd.action(devnet)

export default [deliveryCmd, genesisCmd, bttcCmd, localnetCmd, devnetCmd]
