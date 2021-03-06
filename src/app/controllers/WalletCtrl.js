import * as simpleWalletProvider from "../lib/simpleWalletProvider";
export default class WalletCtrl {
    constructor($scope, $rootScope) {
        $scope.mnemonic = "";
        $scope.privateKey = "";
        $scope.addressBCH = "";
        $scope.walletInfo = {};
        $scope.connectedPrivateKey = localStorage.getItem("HC_BCH_PRIVATE_KEY");
        $scope.connectedMnemonic = localStorage.getItem("HC_BCH_MNEMONIC");
        $scope.addressBalance = 0;

        let simpleWallet, lSimpleWallet;

        const getBalance = async () => {
            let walletInfo;

            try {
                walletInfo = await simpleWallet.getWalletInfo();
            } catch (err) {
                $scope.addressBalance = 0;
            }

            $scope.walletInfo = walletInfo
            $scope.addressBalance = walletInfo.balance;
        };


        $scope.onMnemonicChange = (newMnemonic) => {
            if (newMnemonic && newMnemonic.split(" ").length > 10) {
                $scope.canConnectMnemonic = true;

                return;
            } 

            $scope.canConnectMnemonic = false;
        };

        if ($scope.connectedMnemonic) {
            simpleWallet = new SimpleWallet($scope.connectedMnemonic);

            simpleWalletProvider.set(simpleWallet);

            $scope.mnemonic = simpleWallet.mnemonic;
            $scope.privateKey = simpleWallet.privateKey;
            $scope.addressBCH = simpleWallet.address;
            $scope.legacyAddressBCH = simpleWallet.legacyAddress;

            getBalance();
        }

        $scope.generate = () => {
            lSimpleWallet = new SimpleWallet();

            $scope.mnemonic = lSimpleWallet.mnemonic;
            $scope.privateKey = lSimpleWallet.privateKey;
            $scope.addressBCH = lSimpleWallet.address;
            $scope.legacyAddressBCH = lSimpleWallet.legacyAddress;
        }

        $scope.withdraw = async (toAddress) => {
            const simpleWallet = simpleWalletProvider.get();
            
            const balance = await simpleWallet.getBalance();

            console.log(`Transfering ${balance} to ${toAddress}`);

            simpleWallet.send([
                { address: toAddress, amountSat: 1000 }
            ]);
        };

        $scope.connect = (privateKey) => {
            if (!lSimpleWallet) {
                lSimpleWallet = new SimpleWallet(privateKey);

                $scope.privateKey = lSimpleWallet.privateKey;
            }

            $scope.connectedPrivateKey = lSimpleWallet.privateKey;
            $scope.connectedMnemonic = lSimpleWallet.mnemonic;

            $scope.mnemonic = lSimpleWallet.mnemonic;
            $scope.privateKey = lSimpleWallet.privateKey;
            $scope.addressBCH = lSimpleWallet.address;
            $scope.legacyAddressBCH = lSimpleWallet.legacyAddress;

            $rootScope.simpleWallet = {
                address: lSimpleWallet.address,
                mnemonic: lSimpleWallet.mnemonic,
                privateKey: lSimpleWallet.privateKey
            };

            localStorage.setItem("HC_BCH_PRIVATE_KEY", lSimpleWallet.privateKey);
            localStorage.setItem("HC_BCH_MNEMONIC", lSimpleWallet.mnemonic);

            simpleWalletProvider.set(lSimpleWallet);
        };

        $scope.onDepositClick = () => {
            setTimeout(() => {
                const container = document.getElementsByClassName("deposit-address-qr")[0];

                container.innerHTML = "";

                new QRCode(container, simpleWalletProvider.get().address);
            }, 50);
        };

        $scope.disconnect = () => {
            lSimpleWallet = null;

            $scope.connectedPrivateKey = null;
            $scope.connectedMnemonic = null;

            $scope.mnemonic = null;
            $scope.privateKey = null;
            $scope.addressBCH = null;
            $scope.legacyAddressBCH = null;

            $scope.canConnectMnemonic = false;

            simpleWalletProvider.set(null);
            $rootScope.simpleWallet = null;

            localStorage.setItem("HC_BCH_PRIVATE_KEY", "");
            localStorage.setItem("HC_BCH_MNEMONIC", "");
        };
    }
}

WalletCtrl.$inject = [ "$scope", "$rootScope" ];
