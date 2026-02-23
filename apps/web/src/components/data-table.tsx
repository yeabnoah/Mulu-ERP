"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { ChevronDownIcon, ChevronsLeftIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsRightIcon, Columns3Icon, FilterIcon, GripVerticalIcon, SearchIcon, XIcon, PrinterIcon } from "lucide-react"

export type DataTableFilterOption<TData> = {
  id: string
  label: string
  options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[]
  type?: "select" | "boolean"
  multiSelect?: boolean
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  title?: string
  headerActions?: React.ReactNode
  getRowId?: (row: TData) => string
  isLoading?: boolean
  filters?: DataTableFilterOption<TData>[]
  onSelectionChange?: (selectedRows: TData[]) => void
  searchable?: boolean
  searchPlaceholder?: string
  onPrint?: (data: TData[]) => void
}

function handlePrint(data: any[], columns: any[], title?: string) {
  // Get visible columns
  const visibleColumns = columns.filter((col: any) => col.accessorKey || col.accessorFn)

  // Helper to get column header
  const getColumnHeader = (col: any) => {
    if (typeof col.header === "function") {
      // Try to get header from accessorKey or id
      return col.accessorKey || col.id
    }
    return col.header || col.accessorKey || col.id
  }

  // Helper to get cell value
  const getCellValue = (row: any, col: any) => {
    if (col.accessorFn) {
      return col.accessorFn(row)
    }
    const value = row[col.accessorKey]
    // Handle nested objects (like roles, family, zone, ministry)
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        // Handle arrays like roles
        return value.map((item: any) => item.role?.name || item.name || "").filter(Boolean).join(", ")
      }
      // Handle single objects
      return value.name || value.title || JSON.stringify(value)
    }
    return value ?? ""
  }

  // Create print content
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title || "Report"}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { margin-bottom: 5px; }
        .date { color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f5f5f5; font-weight: bold; }
        tr:nth-child(even) { background-color: #fafafa; }
        @media print {
          body { -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <h1>${title || "Report"}</h1>
      <p class="date">Generated: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${visibleColumns.map((col: any) => `<th>${getColumnHeader(col)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${data.map((row: any) => `
            <tr>
              ${visibleColumns.map((col: any) => `<td>${getCellValue(row, col)}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.print()
}

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <GripVerticalIcon className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

function DraggableRow<TData>({ row }: { row: Row<TData> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: (row.original as any).id,
  })
  const isSelected = row.getIsSelected()
  return (
    <TableRow
      key={row.id + (isSelected ? "-selected" : "")}
      data-state={isSelected && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  title,
  headerActions,
  getRowId = (row: any) => row.id.toString(),
  isLoading,
  filters,
  onSelectionChange,
  searchable = true,
  searchPlaceholder = "Search...",
}: DataTableProps<TData, TValue>) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => (data as any[])?.map(({ id }) => id) || [],
    [data]
  )

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Sync active filters with column filters
  React.useEffect(() => {
    const newFilters: ColumnFiltersState = Object.entries(activeFilters)
      .filter(([_, value]) => value && value.length > 0)
      .map(([id, value]) => ({ id, value: value.join("|") }))
    setColumnFilters(newFilters)
  }, [activeFilters])

  function handleFilterChange(filterId: string, value: string, multiSelect?: boolean) {
    if (multiSelect) {
      setActiveFilters((prev) => {
        const current = prev[filterId] || []
        if (current.includes(value)) {
          return { ...prev, [filterId]: current.filter((v) => v !== value) }
        }
        return { ...prev, [filterId]: [...current, value] }
      })
    } else {
      setActiveFilters((prev) => ({
        ...prev,
        [filterId]: [value],
      }))
    }
  }

  function clearFilter(filterId: string) {
    setActiveFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[filterId]
      return newFilters
    })
  }

  function getFilterBadge(filterId: string) {
    const filter = filters?.find((f) => f.id === filterId)
    const values = activeFilters[filterId] || []
    if (values.length === 0) return null
    if (values.length === 1) {
      const option = filter?.options.find((o) => o.value === values[0])
      return option?.label || values[0]
    }
    return `${values.length} selected`
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
    getRowId,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Notify parent of selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)
      onSelectionChange(selectedRows as TData[])
    }
  }, [rowSelection, table, onSelectionChange])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data as any[], oldIndex, newIndex) as TData[]
      })
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between px-6 lg:px-8">
        <h2 className="text-base font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {searchable && (
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-8 w-64"
              />
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePrint(table.getFilteredRowModel().rows.map(r => r.original), columns, title)}
          >
            <PrinterIcon className="mr-2 h-4 w-4" />
            Print
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm">
                  <Columns3Icon data-icon="inline-start" />
                  Columns
                  <ChevronDownIcon data-icon="inline-end" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-32">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {headerActions}
        </div>
      </div>
      {filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-6 lg:px-8">
          {Object.keys(activeFilters).length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setActiveFilters({})}
            >
              Clear all
            </Button>
          )}
          {filters.map((filter) => {
            const badge = getFilterBadge(filter.id)
            return (
              <DropdownMenu key={filter.id}>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant={badge ? "secondary" : "outline"}
                      size="sm"
                      className="gap-2"
                    >
                      <FilterIcon className="size-4" />
                      <span>{filter.label}</span>
                      {badge && <span className="text-xs opacity-70">({badge})</span>}
                    </Button>
                  }
                />
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {filter.options.map((option) => (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={activeFilters[filter.id]?.includes(option.value) || false}
                        onCheckedChange={() => handleFilterChange(filter.id, option.value, true)}
                      >
                        {option.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                    {badge && (
                      <>
                        <DropdownMenuSeparator />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-muted-foreground"
                          onClick={() => clearFilter(filter.id)}
                        >
                          Clear filter
                        </Button>
                      </>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })}
        </div>
      )}
      <div className="relative flex flex-col gap-4 overflow-auto px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {columns.map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-6 pb-6">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectGroup>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
