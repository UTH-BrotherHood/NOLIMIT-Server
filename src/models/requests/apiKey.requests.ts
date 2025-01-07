export interface Header {
    API_KEY: string;
    AUTHORIZATION: string;
}

export const HEADERS: Header = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
} as const;