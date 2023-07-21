const NftList = require('../../models/NftList');
const Account = require('../../models/Account');

const DEGENLAND_NFT_ID = "0.0.1783975";
const TYCOON_NFT_ID = "0.0.1467455";
const MOGUL_NFT_ID = "0.0.1467309";
const INVESTOR_NFT_ID = "0.0.1467207";

exports.setNft = async (req, res) => {
  try {
    if (!req.body.accountId || !req.body.nftData) {
      res.send({
        status: false,
        message: 'failed'
      });
    } else {
      let nftData = req.body.nftData;
      let accountId = req.body.accountId;

      await NftList.updateMany({ owner: accountId }, { owner: null });

      for (let i = 0; i < nftData.length; i++) {
        let oldnftData = await NftList.findOne({ name: nftData[i].name, serial_number: nftData[i].serial_number });
        if (oldnftData.owner != nftData[i].owner) {
          let newnftData = await NftList.findOneAndUpdate(
            { name: nftData[i].name, serial_number: nftData[i].serial_number },
            {
              token_id: nftData[i].token_id,
              owner: nftData[i].owner
            },
            { new: true }
          );
        }
      }
      //send response
      res.send({
        status: true,
        message: 'Success',
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

exports.addNftList = async (req, res) => {
  try {
    if (!req.body.accountId || !req.body.nftData) {
      res.send({
        status: false,
        message: 'failed'
      });
    } else {
      let accountId = atob(req.body.accountId);
      let nftData = JSON.parse(atob(req.body.nftData));
      let _nftCount = {
        degenlandCount: 0,
        tycoonCount: 0,
        mogulCount: 0,
        investorCount: 0
      };

      for (let i = 0; i < nftData.length; i++) {
        if (nftData[i].tokenId === DEGENLAND_NFT_ID) {
          _nftCount.degenlandCount += 1;
        } else if (nftData[i].tokenId === TYCOON_NFT_ID) {
          _nftCount.tycoonCount += 1;
        } else if (nftData[i].tokenId === MOGUL_NFT_ID) {
          _nftCount.mogulCount += 1;
        } else if (nftData[i].tokenId === INVESTOR_NFT_ID) {
          _nftCount.investorCount += 1;
        }

        await NftList.findOneAndUpdate(
          { token_id: nftData[i].tokenId, serial_number: nftData[i].serialNum },
          { owner: accountId }
        );
      }

      await Account.findOneAndUpdate(
        { accountId: accountId },
        {
          degenlandCount: _nftCount.degenlandCount,
          tycoonCount: _nftCount.tycoonCount,
          mogulCount: _nftCount.mogulCount,
          investorCount: _nftCount.investorCount
        }
      );
      //send response
      res.send({
        status: true,
        message: 'Success',
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

exports.getNFTData = async (req, res) => {
  try {
    //Get all NFT Data
    let allNFTData = await NftList.find({});
    let NFTData = [];
    for (let i = 0; i < allNFTData.length; i++) {
      if (allNFTData[i].owner != null)
        NFTData.push(allNFTData[i]);
    }
    //send response
    res.send({
      status: true,
      message: 'Success',
      data: NFTData
    });
  } catch (err) {
    res.status(500).send(err);
  }
}