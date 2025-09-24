#!/bin/bash
NODES=10
BASE_P2P=16111
BASE_RPC=16110
BASE_BORSH=16112

for i in $(seq 1 $NODES); do
	APPDIR="./target/node$i"
	P2P=$((BASE_P2P + (i-1)*10))
	RPC=$((BASE_RPC + (i-1)*10))
	BORSH=$((BASE_BORSH + (i-1)*10))
	export NODE_ID=$i

	mkdir -p $APPDIR


	for j in $(seq 1 $((i-1))); do
		PEERS="$PEERS --addpeer=127.0.0.1:$((BASE_P2P + (j-1)*10))"
	done

	./target/release/kaspad \
		--appdir $APPDIR \
		--listen=127.0.0.1:$P2P \
		--rpclisten=127.0.0.1:$RPC \
		--rpclisten-borsh=127.0.0.1:$BORSH \
		--disable-upnp \
		--enable-unsynced-mining \
		--devnet \
		--utxoindex \
		$PEERS &
done

sleep 5

sudo tc qdisc del dev lo root 2>/dev/null
sudo tc qdisc add dev lo root netem delay 100ms 20ms loss 5% rate 50mbit
