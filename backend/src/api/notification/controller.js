
const Notification = require('../../models/Notification');
const RewardInfo = require('../../models/RewardInfo');

exports.getNotification = async (req_, res_) => {
  console.log("------getNotification - 1 ----", req_.query);
  try {
    const g_accountId = req_.query.accountId;

    const g_notificationList = await Notification.find({ accountId: g_accountId });

    const rewardInfo = await RewardInfo.findOne({ accountId: g_accountId, $or: [{ status: 'pending' }, { status: 'claimable' }] });

    let res_notificationList;
    let broadcast_notificationList;
    if (rewardInfo) {
      broadcast_notificationList = await Notification.find({ _id: rewardInfo.notificationId });
      res_notificationList = g_notificationList.concat(broadcast_notificationList);
    }
    else
      res_notificationList = g_notificationList;

    if (!res_notificationList)
      return res_.send({ result: true, data: res_notificationList, message: "No notification" });
  
    return res_.send({ result: true, data: res_notificationList });
  } catch (error) {
    return res_.send({ result: false, error: 'Error detected in server progress!' });
  }
}

exports.getInviteState = async (req_, res_) => {
  console.log("------getNotification - 1 ----", req_.query);
  try {
    const myAccountId = req_.query.myAccountId;
    const otherAccountId = req_.query.otherAccountId;
  
    const resData = await Notification.find({ alertType: 'invite friend', accountId: otherAccountId, 'playerInfo.accountId': myAccountId, state: 'unread' });
  
    if (resData.length == 0)
      return res_.send({ result: false });
  
    return res_.send({ result: true });
  } catch (error) {
    return res_.send({ result: false, error: 'Error detected in server progress!' });
  }
}

exports.setRead = async (req_, res_) => {
  console.log("------setRead - 1 ----", req_.body);
  try {
    const g_id = req_.body.id;
  
    await Notification.findOneAndDelete({ _id: g_id });

    return res_.send({ result: true});
  } catch (error) {
    return res_.send({ result: false, error: 'Error detected in server progress!' });
  }
}
