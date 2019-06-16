cp ../everdragons-eggs/build/eth/EverDragonsVoucher.json ./ABI/eth/
cp ../everdragons-contract/build/eth/EverDragons.json ./ABI/eth/
cp ../everdragons-contract/build/eth/ReverseAuction.json ./ABI/eth/
cp ../everdragons-contract/build/eth/EverDragonsBridge.json ./ABI/eth/
cp ../everdragons-contract/build/eth/EverDragonsPlayer.json ./ABI/eth/
cp ../everdragons-race/build/eth/Race.json ./ABI/eth/
cp ../everdragons-tictactoe/build/eth/TicTacToe.json ./ABI/eth/
cp ../everdragons-goldmine/build/eth/Goldmine.json ./ABI/eth/
cp ../everdragons-contract/build/eth/Registrar.json ./ABI/eth/

cp ../everdragons-eggs/build/tron/EverDragonsVoucher.json ./ABI/tron/
cp ../everdragons-contract/build/tron/EverDragons.json ./ABI/tron/
cp ../everdragons-contract/build/tron/ReverseAuction.json ./ABI/tron/
cp ../everdragons-contract/build/tron/EverDragonsBridge.json ./ABI/tron/
cp ../everdragons-contract/build/tron/EverDragonsPlayer.json ./ABI/tron/
cp ../everdragons-race/build/tron/Race.json ./ABI/tron/
cp ../everdragons-tictactoe/build/tron/TicTacToe.json ./ABI/tron/
cp ../everdragons-goldmine/build/tron/Goldmine.json ./ABI/tron/
cp ../everdragons-contract/build/tron/Registrar.json ./ABI/tron/

cd ../../everdragons-shared/
node conv-abi.js ABI/eth  ABI-opt/eth
node conv-abi.js ABI/tron ABI-opt/tron
PAUSE
