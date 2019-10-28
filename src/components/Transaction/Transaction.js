import React, { useState, useEffect } from "react";
import ApproveNotice from "./ApproveNotice";
import {
  ethToWbtc,
  wbtcToEth,
  approveERC20,
  ethToSbtc,
  ethToIbtc,
  wbtcToSbtc,
  wbtcToIbtc,
  sbtcToEth,
  sbtcToWbtc,
  sbtcToIbtc,
  ethToCdai,
  ibtcToEth
} from "../../services/flipContract";
import { getTokenAllowance, setTokenAllowance } from "../../services/erc20";
import { assetToAddress } from "../../utils/assets";
import useGetBalance from "../../hooks/useGetBalance";
import Web3 from "web3";
import "./Transaction.css";

export const functionMap = {
  ETH: {
    WBTC: ethToWbtc,
    sBTC: ethToSbtc,
    cDai: ethToCdai,
    dsWBTC: null,
    iBTC: ethToIbtc
  },
  WBTC: {
    ETH: wbtcToEth, 
    sBTC: wbtcToSbtc,
    cDai: null,
    dsWBTC: null,
    iBTC: wbtcToIbtc
  },
  sBTC: {
    ETH: sbtcToEth, 
    WBTC: null, //sbtcToWbtc...failing
    cDai: null,
    dsWBTC: null,
    iBTC: null //sbtcToIbtc...failing
  },
  cDai: {
    ETH: null,
    WBTC: null,
    cDai: null, 
    dsWBTC: null,
    sBTC: null
  },
  iBTC: {
    ETH: ibtcToEth,
    WBTC: null,
    cDai: null, 
    dsWBTC: null,
    sBTC: null
  }
};

function Transaction({ inputAsset, outputAsset }) {
  const [inputAmount, setInputAmount] = useState("");
  const [allowance, setAllowance] = useState("");
  const { balance } = useGetBalance(assetToAddress(inputAsset), inputAsset);
  console.log('balance', balance)
  useEffect(() => {
    const getAllowance = async () => {
      const web3 = new Web3(window.ethereum);

      if (inputAsset !== "ETH" && !!inputAsset) {
        const allowance = await getTokenAllowance(assetToAddress(inputAsset));
        setAllowance(allowance);
        console.log('inputamount', inputAmount)
        console.log('allowance', allowance)
      }
    };
    getAllowance();
  }, [inputAsset]);

  const increaseAllowance = async () => {
    if (inputAsset) {
      await setTokenAllowance(assetToAddress(inputAsset));
    }
  };

  const isApproved = () =>
    inputAsset === "ETH" ? true : allowance > 0 ? true : false;

  const run = async () => {
    if (isApproved()) {
      // run
      if (inputAsset && outputAsset) {
        const func = functionMap[inputAsset][outputAsset];
        console.log("func", func);
        func(inputAmount)
      }
    } else {
      if (inputAsset) {
        increaseAllowance();
      }
    }
  };

  return (
    <div className="d-flex flex-column transaction p-3 my-auto mx-3">
      <div className="mx-auto font-weight-bold tx-headline">Transaction</div>
      <div className="mt-3 tx-text mx-auto">
        Input asset: <span className="tx-asset-text">{inputAsset}</span>
      </div>
      <div className="mt-2 tx-text mx-auto">
        Output asset: <span className="tx-asset-text">{outputAsset}</span>
      </div>
      <div className="mt-4">
        <input
          value={inputAmount}
          onChange={e => setInputAmount(e.target.value)}
          className="tx-input p-1"
          placeholder="Input amount"
        />
      </div>
      <div className="mt-1 input-balance">Input validations coming soon</div>
      <div
        onClick={run}
        className="transact-button mx-auto d-flex justify-content-center align-items-center mt-3"
      >
        {!!inputAsset ? (isApproved() ? "FLIP" : "APPROVE") : "FLIP"}
      </div>
      {!!inputAsset && !isApproved() && (
        <ApproveNotice assetName={inputAsset} />

      )}
    </div>
  );
}

export default Transaction;
