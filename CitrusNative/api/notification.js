import { globalColors } from "../assets/styles";
import { notificationTypes } from "./enum";

export class NotificationFactory {
    static createFriendInvitation(displayName, userId) {
        return {
            type: notificationTypes.INCOMINGFRIENDREQUEST,
            message: `${displayName} sent a friend request`,
            target: userId,
            color: globalColors.green,
            seen: false,
            currencyType: null,
            currencyLegal: null,
            value: null,
        }
    }

    static createFriendRequestAccepted(displayName, userId) {
        return {
            type: notificationTypes.FRIENDREQUESTACCEPTED,
            message: `${displayName} accepted your friend request`,
            target: userId,
            color: globalColors.green,
            seen: false,
            currencyType: null,
            currencyLegal: null,
            value: null,
        }
    }

    static createIncomingGroupInvite(groupName, groupId) {
        return {
            type: notificationTypes.INCOMINGGROUPINVITE,
            message: `You've been invited to join the group "${groupName}"`,
            target: groupId,
            color: globalColors.green,
            seen: false,
            currencyType: null,
            currencyLegal: null,
            value: null,
        }
    }

    static createUserJoinedGroup(displayName, groupName, groupId) {
        return {
            type: notificationTypes.USERJOINEDGROUP,
            message: `${displayName} joined the group "${groupName}"`,
            target: groupId,
            color: globalColors.green,
            seen: false,
            currencyType: null,
            currencyLegal: null,
            value: null,
        }
    }

    static createUserLeftGroup(displayName, groupName, groupId) {
        return {
            type: notificationTypes.USERLEFTGROUP,
            message: `${displayName} left the group "${groupName}"`,
            target: groupId,
            color: globalColors.red,
            seen: false,
            currencyType: null,
            currencyLegal: null,
            value: null,
        }
    }

    static createNewTransaction(displayName, transactionName, transactionId, transactionAmount, transactionCurrencyType, transactionCurrencyLegal) {
        return {
            type: notificationTypes.NEWTRANSACTION,
            message: `${displayName} added "${transactionName}"`,
            target: transactionId,
            color: transactionAmount > 0 ? globalColors.green : globalColors.red,
            seen: false,
            currencyType: transactionCurrencyType,
            currencyLegal: transactionCurrencyLegal,
            value: transactionAmount,
        }
    }

    static createTranscationDeleted(displayName, transactionName, transactionAmount, transactionCurrencyType, transactionCurrencyLegal) {
        return {
            type: notificationTypes.TRANSACTIONDELETED,
            message: `${displayName} deleted "${transactionName}"`,
            target: null,
            color: transactionAmount > 0 ? globalColors.red : globalColors.green,
            seen: false,
            currencyType: transactionCurrencyType,
            currencyLegal: transactionCurrencyLegal,
            value: transactionAmount,
        }
    }

    static createUserSettled(displayName, settleAmount, settleCurrencyLegal, settleCurrencyType) {
        return {
            type: notificationTypes.USERSETTLED,
            message: `${displayName} settled`,
            target: transactionId,
            color: settleAmount > 0 ? globalColors.green : globalColors.red,
            seen: false,
            currencyLegal: settleCurrencyLegal,
            currencyType: settleCurrencyType,
            value: settleAmount,
        }
    }
}