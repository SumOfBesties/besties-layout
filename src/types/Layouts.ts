export interface Layout {
    name: string
    gameCaptureCount: number
    cameraCaptureCount: number
    playerNameplateCount: number
    preview: {
        gridTemplateColumns: string
        gridTemplateRows: string
        gridTemplateAreas: string
    }
}

export const layoutKeys = [
    '16x9-1g1c',
    '16x9-2g1c',
    '4x3-1g1c'
] as const;

export const layouts: Record<typeof layoutKeys[number], Layout> = {
    '16x9-1g1c': {
        name: '16:9 1p',
        gameCaptureCount: 1,
        cameraCaptureCount: 1,
        playerNameplateCount: 1,
        preview: {
            gridTemplateColumns: '1fr 3fr',
            gridTemplateRows: '1fr 0.5fr 0.5fr 1fr 1fr',
            gridTemplateAreas: '"cam-1 game-1" "cam-1 game-1" ". game-1" ". game-1" ". ."'
        }
    },
    '16x9-2g1c': {
        name: '16:9 2p',
        gameCaptureCount: 2,
        cameraCaptureCount: 1,
        playerNameplateCount: 2,
        preview: {
            gridTemplateColumns: '2fr 1fr 1fr 2fr',
            gridTemplateRows: '5fr 4fr 1fr',
            gridTemplateAreas: '"game-1 game-1 game-2 game-2" ". cam-1 cam-1 ." ". . . ."'
        }
    },
    '4x3-1g1c': {
        name: '4:3 1p',
        gameCaptureCount: 1,
        cameraCaptureCount: 1,
        playerNameplateCount: 1,
        preview: {
            gridTemplateColumns: '1fr 2fr',
            gridTemplateRows: '2fr 3fr',
            gridTemplateAreas: '"cam-1 game-1" ". game-1"'
        }
    }
};
