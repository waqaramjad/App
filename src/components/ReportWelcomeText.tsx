import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import Text from './Text';
import UserDetailsTooltip from './UserDetailsTooltip';

type ReportWelcomeTextOnyxProps = {
    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type ReportWelcomeTextProps = ReportWelcomeTextOnyxProps & {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** The policy for the current route */
    policy: OnyxEntry<Policy>;
};

function ReportWelcomeText({report, policy, personalDetails}: ReportWelcomeTextProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    const isChatRoom = ReportUtils.isChatRoom(report);
    const isDefault = !(isChatRoom || isPolicyExpenseChat);
    const participantAccountIDs = report?.participantAccountIDs ?? [];
    const isMultipleParticipant = participantAccountIDs.length > 1;
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(
        // @ts-expect-error TODO: Remove this once OptionsListUtils (https://github.com/Expensify/App/issues/24921) is migrated to TypeScript.
        OptionsListUtils.getPersonalDetailsForAccountIDs(participantAccountIDs, personalDetails),
        isMultipleParticipant,
    );
    const isUserPolicyAdmin = PolicyUtils.isPolicyAdmin(policy);
    const roomWelcomeMessage = ReportUtils.getRoomWelcomeMessage(report, isUserPolicyAdmin);
    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, policy, participantAccountIDs);
    const additionalText = moneyRequestOptions.map((item) => translate(`reportActionsView.iouTypes.${item}`)).join(', ');

    const navigateToReport = () => {
        if (!report?.reportID) {
            return;
        }

        Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID));
    };

    return (
        <>
            <View>
                <Text style={[styles.textHero]}>
                    {isChatRoom ? translate('reportActionsView.welcomeToRoom', {roomName: ReportUtils.getReportName(report)}) : translate('reportActionsView.sayHello')}
                </Text>
            </View>
            <Text style={[styles.mt3, styles.mw100]}>
                {isPolicyExpenseChat && (
                    <>
                        <Text>{translate('reportActionsView.beginningOfChatHistoryPolicyExpenseChatPartOne')}</Text>
                        <Text style={[styles.textStrong]}>{ReportUtils.getDisplayNameForParticipant(report?.ownerAccountID)}</Text>
                        <Text>{translate('reportActionsView.beginningOfChatHistoryPolicyExpenseChatPartTwo')}</Text>
                        <Text style={[styles.textStrong]}>{ReportUtils.getPolicyName(report)}</Text>
                        <Text>{translate('reportActionsView.beginningOfChatHistoryPolicyExpenseChatPartThree')}</Text>
                    </>
                )}
                {isChatRoom && (
                    <>
                        <Text>{roomWelcomeMessage.phrase1}</Text>
                        {roomWelcomeMessage.showReportName && (
                            <Text
                                style={[styles.textStrong]}
                                onPress={navigateToReport}
                                suppressHighlighting
                            >
                                {ReportUtils.getReportName(report)}
                            </Text>
                        )}
                        {roomWelcomeMessage.phrase2 !== undefined && <Text>{roomWelcomeMessage.phrase2}</Text>}
                    </>
                )}
                {isDefault && (
                    <Text>
                        <Text>{translate('reportActionsView.beginningOfChatHistory')}</Text>
                        {displayNamesWithTooltips.map(({displayName, pronouns, accountID}, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <Text key={`${displayName}${pronouns}${index}`}>
                                <UserDetailsTooltip accountID={accountID}>
                                    {ReportUtils.isOptimisticPersonalDetail(accountID) ? (
                                        <Text style={[styles.textStrong]}>{displayName}</Text>
                                    ) : (
                                        <Text
                                            style={[styles.textStrong]}
                                            onPress={() => Navigation.navigate(ROUTES.PROFILE.getRoute(accountID))}
                                            suppressHighlighting
                                        >
                                            {displayName}
                                        </Text>
                                    )}
                                </UserDetailsTooltip>
                                {!!pronouns && <Text>{` (${pronouns})`}</Text>}
                                {index === displayNamesWithTooltips.length - 1 && <Text>.</Text>}
                                {index === displayNamesWithTooltips.length - 2 && <Text>{` ${translate('common.and')} `}</Text>}
                                {index < displayNamesWithTooltips.length - 2 && <Text>, </Text>}
                            </Text>
                        ))}
                    </Text>
                )}
                {!!additionalText && <Text>{translate('reportActionsView.usePlusButton', {additionalText})}</Text>}
            </Text>
        </>
    );
}

ReportWelcomeText.displayName = 'ReportWelcomeText';

export default withOnyx<ReportWelcomeTextProps, ReportWelcomeTextOnyxProps>({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(ReportWelcomeText);
