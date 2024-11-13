export interface ConversationOneToOneReqBody {
    is_group: boolean
    participants: string[]
}

export interface ConversationGroupReqBody {
    is_group: boolean
    participants: string[]
    conversation_name: string
}