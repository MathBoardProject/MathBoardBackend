export interface board {
    id: number,
    ownerId: number,
    boardName: string,
}

export interface stroke {
    id: number,
    boardId: number,
    svg: string,
    x: number,
    y: number,
}