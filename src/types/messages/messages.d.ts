import { ObsConfig, ObsConnectionInfo, Talent } from '../schemas';
import { ScheduleItem } from '../ScheduleHelpers';

export interface MessageInputMap {
    'log:warning': string

    'schedule:import': { slug: string }
    'schedule:setInterstitialCompleted': { scheduleItemId: string, completed: boolean }
    'schedule:updateItem': ScheduleItem

    'speedrun:seekToNextRun': never
    'speedrun:seekToPreviousRun': never
    'speedrun:setActiveSpeedrun': { scheduleItemId: string }

    'nameplate:setActiveRelayPlayer': { teamId: string, playerId: string }

    'talent:updateTalentItems': Talent
    'talent:setCurrentHost': Talent[number]
    'talent:removeCurrentHost': never

    'timer:start': never
    'timer:stop': { teamId?: string, forfeit?: boolean } | undefined
    'timer:undoStop': { teamId?: string } | undefined
    'timer:pause': never
    'timer:reset': never

    'obs:connect': ObsConnectionInfo
    'obs:setConfig': ObsConfig
    'obs:setEnabled': { enabled: boolean }

    'tracker:newDonation': { amount: number, displayName: string | undefined | null }
}

type MessagesWithoutReturnValues = Exclude<keyof MessageInputMap, keyof InnerMessageResultMap>;

interface InnerMessageResultMap {

}

export type MessageResultMap = InnerMessageResultMap & {
    [Key in MessagesWithoutReturnValues]: void
}
