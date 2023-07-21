const Account = require('../models/Account');
const Building = require('../models/Building');
const NftList = require('../models/NftList');
const Place = require('../models/Place');
const Placement = require('../models/Placement');
const RewardInfo = require('../models/RewardInfo');
const BuyBuildingHistory = require('../models/BuyBuildingHistory');
const BuyBuilding = require('../models/BuyBuilding');
const PalTokenSaleHistory = require('../models/PalTokenSaleHistory');
const Furniture = require('../models/Furniture');

exports.init = async () => {
  //init account info
  let accountInfo = await Account.find({});
  if (accountInfo.length > 0) {
    for (let i = 0; i < accountInfo.length; i++) {
      await Account.findOneAndUpdate(
        { _id: accountInfo[i]._id },
        {
          frame: 10,
          address: "",
          targetPos: "",
          nftAddress: '',
          x: 0,
          y: 0,
          n: 0,
          m: 0,
          socketId: "",
          connectState: false,
          loginState: false,
          isdancing: false,
          ismoving: false,
          hasNightclubTicket: false,
          targetn: 0,
          targetm: 0,
          buildingInsideInfo: {
            buildingId: "",
            address: "",
            targetPos: "",
            x: 0,
            y: 0,
            n: 0,
            m: 0,
            isIn: false
          }
        }
      );
    }
  }

  // await Place.updateMany({}, {score: 0});

  // await Place.updateMany({}, { score: 0 });

  // const placementInfo = await Placement.find({});
  // for (let i = 0;i < placementInfo.length;i++) {
  //   const placeInfo = await Place.findOne({ address: placementInfo[i].address, pos: placementInfo[i].pos });
  //   if (placementInfo[i].type == 12 || placementInfo[i].type == 13 || placementInfo[i].type == 24) {
  //     const buildingInfo = await Building.findOne({ index: placementInfo[i].type });
  //     await Place.findOneAndUpdate(
  //       { address: placementInfo[i].address, pos: placementInfo[i].pos },
  //       { score: placeInfo.score + buildingInfo.score }
  //     );
  //   }
  // }

  // const buyBuildingHistoryInfo = await BuyBuildingHistory.find({});
  // for (let i = 0;i < buyBuildingHistoryInfo.length;i++) {
  //   const buildingInfo = await Building.findOne({ index: buyBuildingHistoryInfo[i].buildingIndex });
  //   console.log(buildingInfo);
  //   const placeInfo = await Place.findOne({ address: buyBuildingHistoryInfo[i].address, pos: buyBuildingHistoryInfo[i].pos });
  //   await Place.findOneAndUpdate(
  //     { address: buyBuildingHistoryInfo[i].address, pos: buyBuildingHistoryInfo[i].pos },
  //     { score: placeInfo.score + buildingInfo.score }
  //   );
  // }

  // const placementInfo = await Placement.find({});
  // for (let i = 0; i < placementInfo.length; i++) {
  //   if (placementInfo[i].type >= 31) {
  //     await Placement.findOneAndUpdate(
  //       { _id: placementInfo[i]._id },
  //       { type: placementInfo[i].type + 2 }
  //     );
  //   }
  // }

  // const buyBuildingHistoryInfo = await BuyBuildingHistory.find({});
  // for (let i = 0; i < buyBuildingHistoryInfo.length; i++) {
  //   if (buyBuildingHistoryInfo[i].buildingIndex >= 31) {
  //     await BuyBuildingHistory.findOneAndUpdate(
  //       { _id: buyBuildingHistoryInfo[i]._id },
  //       { buildingIndex: buyBuildingHistoryInfo[i].buildingIndex + 2 }
  //     );
  //   }
  // }

  // const buyBuildingInfo = await BuyBuilding.find({});
  // for (let i = 0; i < buyBuildingInfo.length; i++) {
  //   if (buyBuildingInfo[i].index >= 31) {
  //     await BuyBuilding.findOneAndUpdate(
  //       { _id: buyBuildingInfo[i]._id },
  //       { index: buyBuildingInfo[i].index + 2 }
  //     );
  //   }
  // }

  // const furnitureInfo = await Furniture.find({});
  // for (let i = 0; i < furnitureInfo.length; i++) {
  //   await Furniture.updateMany(
  //     { _id: furnitureInfo[i]._id },
  //     { type: furnitureInfo[i].type + 2 }
  //   );
  // }

  //place current visitor init
  await Place.updateMany({}, { currentVisitor: 0 });

  //buildings init
  let buildingInfo = await Building.find({});

  if (buildingInfo.length == 0) {
    for (let i = 0; i <= 47; i++) {
      if (i == 0) {
        buildingInfo = new Building({
          index: i,
          type: 'ground',
          url: '/buildings/ground/g(' + i + ').png',
          default: true,
          size: '1*1',
          cost: 0,
          score: 1,
          sizex: 0,
          sizey: 0
        });
      }
      else if (i >= 1 && i <= 11) {
        buildingInfo = new Building({
          index: i,
          type: 'road',
          url: '/buildings/road/r (' + i + ').png',
          default: true,
          size: '1*1',
          cost: 0,
          score: 1,
          sizex: 0,
          sizey: 0
        });
      }
      else if (i >= 12 && i <= 32) {
        let buildingSize;
        let name;
        let score;
        let buildtime;
        let sizex = 0;
        let sizey = 0;
        if (i == 12) {
          buildingSize = '1*2';
          score = 1;
          name = 'free building';
          buildtime = 20;
          cost = 0;
        }
        else if (i == 13) {
          buildingSize = '2*1';
          score = 1;
          name = 'free building';
          buildtime = 20;
          cost = 0;
        }
        else if (i >= 14 && i <= 18) {
          buildingSize = '2*2';
          score = 20;
          name = '';
          buildtime = 20;
          cost = 1000;
        }
        else if (i == 19) {
          buildingSize = '2*2';
          score = 200;
          name = 'Coffee';
          buildtime = 20;
          cost = 2000;
        }
        else if (i == 20) {
          buildingSize = '2*2';
          score = 250;
          name = 'Small house';
          buildtime = 20;
          cost = 3000;
          sizex = 5;
          sizey = 5;
        }
        else if (i == 21) {
          buildingSize = '1*2';
          score = 250;
          name = 'Billboard';
          buildtime = 3;
          cost = 3000;
        }
        else if (i == 22) {
          buildingSize = '4*4';
          score = 250;
          name = '';
          buildtime = 20;
          cost = 3000;
        }
        else if (i == 23) {
          buildingSize = '4*4';
          score = 250;
          name = 'Food';
          buildtime = 20;
          cost = 3000;
        }
        else if (i == 24) {
          buildingSize = '3*3';
          score = 1250;
          name = 'Medium house';
          buildtime = 20;
          cost = 5000;
          sizex = 6;
          sizey = 6;
        }
        else if (i == 25) {
          buildingSize = '4*4';
          score = 1250;
          name = 'Skyscraper';
          buildtime = 20;
          cost = 5000;
        }
        else if (i == 26) {
          buildingSize = '7*7';
          score = 7500;
          name = 'Night Club';
          buildtime = 20;
          cost = 30000;
        }
        else if (i == 27) {
          buildingSize = '7*8';
          score = 1750;
          name = 'Mall';
          buildtime = 20;
          cost = 7500;
        }
        else if (i == 28) {
          buildingSize = '9*11';
          score = 2500;
          name = 'Arena';
          buildtime = 20;
          cost = 10000;
        }
        else if (i == 29) {
          buildingSize = '4*4';
          score = 10000;
          name = 'Mansion';
          buildtime = 20;
          cost = 40000;
          sizex = 7;
          sizey = 7;
        }
        else if (i == 30) {
          buildingSize = '7*7';
          score = 20000;
          name = 'Casino';
          buildtime = 20;
          cost = 80000;
        }
        else if (i == 31) {
          buildingSize = '4*5';
          score = 1250;
          name = 'spa';
          buildtime = 20;
          cost = 5000;
        }
        else if (i == 32) {
          buildingSize = '7*7';
          score = 1250;
          name = 'pool';
          buildtime = 20;
          cost = 5000;
        }

        buildingInfo = new Building({
          index: i,
          type: 'building',
          url: '/buildings/building/b (' + (i - 11) + ').png',
          name: name,
          default: true,
          size: buildingSize,
          cost: cost,
          score: score,
          buildtime: buildtime,
          sizex: sizex,
          sizey: sizey
        });
      }
      else if (i >= 33 && i <= 42) {
        let buildingSize;
        let score;
        if (i >= 33 && i <= 40) {
          buildingSize = '1*1';
          score = 2;
        }
        else if (i == 41) {
          buildingSize = '1*2';
          score = 4;
        }
        else if (i == 42) {
          buildingSize = '2*1';
          score = 4;
        }
        buildingInfo = new Building({
          index: i,
          type: 'object',
          url: '/buildings/object/object' + (i - 32) + '.png',
          name: '',
          default: true,
          size: buildingSize,
          cost: 0,
          score: score,
          buildtime: 0,
          sizex: 0,
          sizey: 0
        });
      }
      else {
        let buildingSize;
        let score;
        let name;
        let cost;
        if (i == 43) {
          buildingSize = '1*1';
          name = 'Table';
          score = 20;
          cost = 200;
        }
        else if (i == 44) {
          buildingSize = '1*1';
          name = 'TV';
          score = 20;
          cost = 200;
        }
        else if (i == 45) {
          buildingSize = '2*1';
          name = 'Cloud';
          score = 20;
          cost = 200;
        }
        else if (i == 46) {
          buildingSize = '2*2';
          name = 'Bed';
          score = 20;
          cost = 200;
        }
        else if (i == 47) {
          buildingSize = '3*4';
          name = 'Rug';
          score = 20;
          cost = 200;
        }
        buildingInfo = new Building({
          index: i,
          type: 'furniture',
          url: '/buildings/furniture/furniture' + (i - 42) + '.png',
          name: name,
          default: true,
          size: buildingSize,
          cost: cost,
          score: score,
          buildtime: 0,
          sizex: 0,
          sizey: 0
        });
      }
      await buildingInfo.save();
    }
  }

  //nft init
  const DEGENLAND_NFT_ID = "0.0.1783975";
  const TYCOON_NFT_ID = "0.0.1467455";
  const MOGUL_NFT_ID = "0.0.1467309";
  const INVESTOR_NFT_ID = "0.0.1467207";

  let nft = await NftList.find({});
  if (nft.length == 0) {
    for (let i = 1; i < 10000; i++) {
      if (i <= 1000) {
        let grandnft = new NftList({
          name: 'Degen',
          token_id: DEGENLAND_NFT_ID,
          serial_number: i
        });
        await grandnft.save();

        let bignft = new NftList({
          name: 'Tycoon',
          token_id: TYCOON_NFT_ID,
          serial_number: i
        });
        await bignft.save();

        let mediumnft = new NftList({
          name: 'Mogul',
          token_id: MOGUL_NFT_ID,
          serial_number: i
        });
        await mediumnft.save();

        let smallnft = new NftList({
          name: 'Investor',
          token_id: INVESTOR_NFT_ID,
          serial_number: i
        });
        await smallnft.save();
      }
      else if (i <= 2000) {
        let bignft = new NftList({
          name: 'Tycoon',
          token_id: TYCOON_NFT_ID,
          serial_number: i
        });
        await bignft.save();

        let mediumnft = new NftList({
          name: 'Mogul',
          token_id: MOGUL_NFT_ID,
          serial_number: i
        });
        await mediumnft.save();

        let smallnft = new NftList({
          name: 'Investor',
          token_id: INVESTOR_NFT_ID,
          serial_number: i
        });
        await smallnft.save();
      }
      else if (i <= 3000) {
        let mediumnft = new NftList({
          name: 'Mogul',
          token_id: MOGUL_NFT_ID,
          serial_number: i
        });
        await mediumnft.save();

        let smallnft = new NftList({
          name: 'Investor',
          token_id: INVESTOR_NFT_ID,
          serial_number: i
        });
        await smallnft.save();
      }
      else if (i <= 4000) {
        let smallnft = new NftList({
          name: 'Investor',
          token_id: INVESTOR_NFT_ID,
          serial_number: i
        });
        await smallnft.save();
      }
    }
  }

  //place init
  let place = await Place.find({});
  if (place.length == 0) {
    for (let i = 1; i < 10000; i++) {
      if (i <= 1000) {
        let degenlandPlace = new Place({
          token_id: DEGENLAND_NFT_ID,
          serialNumber: i,
          name: 'degen-' + i
        });
        await degenlandPlace.save();

        let tycoonPlace = new Place({
          token_id: TYCOON_NFT_ID,
          serialNumber: i,
          name: 'tycoon-' + i
        });
        await tycoonPlace.save();

        let mogulPlace = new Place({
          token_id: MOGUL_NFT_ID,
          serialNumber: i,
          name: 'mogul-' + i
        });
        await mogulPlace.save();

        let investorPlace = new Place({
          token_id: INVESTOR_NFT_ID,
          serialNumber: i,
          name: 'investor-' + i
        });
        await investorPlace.save();
      }
      else if (i <= 2000) {
        let tycoonPlace = new Place({
          token_id: TYCOON_NFT_ID,
          serialNumber: i,
          name: 'tycoon-' + i
        });
        await tycoonPlace.save();

        let mogulPlace = new Place({
          token_id: MOGUL_NFT_ID,
          serialNumber: i,
          name: 'mogul-' + i
        });
        await mogulPlace.save();

        let investorPlace = new Place({
          token_id: INVESTOR_NFT_ID,
          serialNumber: i,
          name: 'investor-' + i
        });
        await investorPlace.save();
      }
      else if (i <= 3000) {
        let mogulPlace = new Place({
          token_id: MOGUL_NFT_ID,
          serialNumber: i,
          name: 'mogul-' + i
        });
        await mogulPlace.save();

        let investorPlace = new Place({
          token_id: INVESTOR_NFT_ID,
          serialNumber: i,
          name: 'investor-' + i
        });
        await investorPlace.save();
      }
      else if (i <= 4000) {
        let investorPlace = new Place({
          token_id: INVESTOR_NFT_ID,
          serialNumber: i,
          name: 'investor-' + i
        });
        await investorPlace.save();
      }
    }
  }
}