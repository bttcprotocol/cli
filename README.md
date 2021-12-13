# Bttc CLI

🏗 A CLI to setup and manage Bttc validator nodes 

### Installation

```bash
npm install -g @bttcnetwork/bttc-cli
```

Please make sure you have installed following dependencies:

* Git
* Node/npm v10.17.0 (or higher)
* Go 1.16.4
* Rabbitmq (Latest stable version)
* Solc v0.5.11 (https://solidity.readthedocs.io/en/v0.5.3/installing-solidity.html#binary-packages)

### Usage

Create new directory for the setup:

```bash
$ mkdir localnet
$ cd localnet
```

**Check commands**

```bash
bttc-cli
```

**To setup 1 node local network**

This will setup Delivery and Bttc.

```bash
bttc-cli setup localnet
```

It will ask you several questions:

```
Please enter Bttc chain id - You can keep the default one (1029) or change it to any numeric id
Please enter Delivery chain id - You can keep the default one (delivery-1029) or change it to a regex (Delivery-<numeric id>)
Please enter Bttc branch or tag - master
Please enter Delivery branch or tag - master
Please enter Contracts branch or tag - Keep the default branch (stake)
```

After the setup is done, follow these steps:

Start delivery
```bash
bash delivery-start.sh
```

Start delivery bridge
```bash
bash delivery-bridge-start.sh
```

Start delivery rest server
```bash
bash delivery-server-start.sh
```

Setup Bttc
```bash
bash bttc-setup.sh
```

Start bttc
```bash
bash bttc-start.sh
```

**To setup multi-node local network**

```bash
bttc-cli setup devnet
```

It will ask you several questions:

```
Please enter Bttc chain id - You can keep the default one (15001) or change it to any numeric id
Please enter delivery chain id - You can keep the default one (delivery-15001) or change it to a regex (delivery-<numeric id>)
Please enter Bttc branch or tag - master
Please enter delivery branch or tag - master
Please enter Contracts branch or tag - Keep the default branch(stake)
Please enter number of validator nodes - Input the number of validator nodes you want to run
Please enter number of non-validator nodes - Input the number of sentry nodes you want to run
Please enter ETH url - https://goerli.infura.io/v3/<YOUR_INFURA_KEY>
Please select devnet type - remote (for remote setup)
```

After the setup is done, follow these steps:


Start delivery
```bash
bash delivery-start.sh
```

Start delivery bridge
```bash
bash delivery-bridge-start.sh
```

Start delivery rest server
```bash
bash delivery-server-start.sh
```

Setup Bttc
```bash
bash bttc-setup.sh
```

Start bttc
```bash
bash bttc-start.sh
```

**Logs**

Logs will be at `logs/` folder

**Clean Setup**
Remove the localnet folder and you can start the process once again

## License

MIT
