export interface board {
    id: number,
    ownerId: number,
    boardName: string,
}

export interface query { //think if it is good idea to store queries with that or delete this.
    query: string,
    data: string[] | number[] | null,
}

export interface stroke {
    id: number,
    boardId: number,
    svg: string,
    x: number,
    y: number,
}