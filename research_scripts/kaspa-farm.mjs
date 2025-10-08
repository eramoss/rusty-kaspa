import { Wallet, initKaspaFramework } from '@kaspa/wallet';
import { RPC } from '@kaspa/grpc-node';
import { spawn } from "child_process";

const NODES = 2;
const BASE_RPC = 16110;

const AMOUNT = 1;

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const wallets = [];
const rpcConnections = [];

function logStep(msg) {
	console.log(`\n=== ${msg} ===`);
}

async function createWallet(i, rpcHost) {
	console.log(`Creating wallet for node ${i} (RPC ${rpcHost})...`);
	const rpc = new RPC({ clientConfig: { host: rpcHost, reconnect: false }});
	const wallet = new Wallet(null, null, { network: 'kaspadev', rpc });
	await wallet.sync(true);
	console.log(`Wallet #${i} address: ${wallet.receiveAddress}`);
	return { wallet, rpc };
}

async function main() {
	await initKaspaFramework();

	logStep(`Creating ${NODES} wallets`);
	for (let i = 0; i < NODES; i++) {
		const rpcPort = BASE_RPC + i * 10;
		const rpcHost = `127.0.0.1:${rpcPort}`;
		const { wallet, rpc } = await createWallet(i + 1, rpcHost);
		wallets.push(wallet);
		rpcConnections.push(rpc);
	}

	logStep("Starting miners for all wallets");

	wallets.forEach((w, i) => {
		console.log(`Miner would start for wallet #${i + 1} → ${w.receiveAddress}`);
	});

	const nodeCount = wallets.length;
	const addresses = wallets.map(w => w.receiveAddress);

	const minerProc = spawn("./devnet_launch_miners.sh", [nodeCount, ...addresses], {
		shell: true
	});

	minerProc.on("exit", code => {
		console.log(`devnet_launch_miners.sh exited with code ${code}`);
	});

	await delay(20000);
	wallets.map(w => w.update());


	logStep("Broadcasting transactions between all wallets");

	const AMOUNT_SOMPI = AMOUNT;
	while (true) {
		for (let i = 0; i < wallets.length; i++) {
			const sender = wallets[i];

			for (let j = 0; j < wallets.length; j++) {
				if (i === j) continue; 

				const recipient = wallets[j].receiveAddress;

				try {
					console.log(`[${new Date().toLocaleTimeString()}] Wallet #${i+1} → Wallet #${j+1}: sending ${AMOUNT} KAS`);
					await sender.submitTransaction({
						toAddr: recipient,
						amount: AMOUNT_SOMPI * 1e8,
						calculateNetworkFee: true
					}, true);
					console.log(`✅ TX from #${i+1} → #${j+1} submitted successfully.`);
				} catch (e) {
					console.warn(`⚠️  TX from #${i+1} → #${j+1} failed:`, e.message);
					try {
						const balance = await sender.balance;
						console.log(`   💰 Wallet #${i+1} balance: ${JSON.stringify(balance)}`);
						sender.update();
					} catch (balanceErr) {
						console.warn(`   ⚠️ Could not fetch balance:`, balanceErr.message);
					}
				}
			}
		}
	}
}

main().catch((e) => {
	console.error("Fatal error:", e);
	process.exit(1);
});
