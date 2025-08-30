import { asc, desc, gt, lt, sql, Table, Column } from "drizzle-orm"

type PaginatedResult<T> = {
  data: T[]
  limit: number
  nextCursor: string | null
  prevCursor: string | null
  hasNextPage: boolean
  hasPrevPage: boolean
}

export async function paginateWithCursor<T>({
  db,
  table,
  cursorColumn,
  cursor,
  limit,
  direction = "forward",
}: {
  db: any
  table: Table
  cursorColumn: Column
  cursor?: string
  limit: number
  direction?: "forward" | "backward"
}): Promise<PaginatedResult<T>> {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 200) : 20

  let comparator
  if (cursor) {
    comparator =
      direction === "forward"
        ? gt(cursorColumn, cursor as any)
        : lt(cursorColumn, cursor as any)
  }

  const order = direction === "forward" ? asc(cursorColumn) : desc(cursorColumn)

  let rows: T[]
  if (comparator) {
    rows = await db
      .select()
      .from(table)
      .where(comparator)
      .orderBy(order)
      .limit(safeLimit + 1)
  } else {
    rows = await db
      .select()
      .from(table)
      .orderBy(order)
      .limit(safeLimit + 1)
  }

  const hasMore = rows.length > safeLimit
  let data = hasMore ? rows.slice(0, safeLimit) : rows
  if (direction === "backward") data = data.reverse()

  const firstRow = data[0]
  const lastRow = data[data.length - 1]

  const nextCursor =
    hasMore && direction === "forward"
      ? String((lastRow as any)[cursorColumn.name])
      : null

  const prevCursor =
    direction === "backward"
      ? hasMore
        ? String((firstRow as any)[cursorColumn.name])
        : null
      : firstRow
      ? String((firstRow as any)[cursorColumn.name])
      : null

  return {
    data,
    limit: safeLimit,
    nextCursor,
    prevCursor,
    hasNextPage: direction === "forward" ? hasMore : true,
    hasPrevPage: direction === "backward" ? hasMore : !!cursor,
  }
}
