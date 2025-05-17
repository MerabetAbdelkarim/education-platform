import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Flex,
    IconButton,
    Text,
    Tooltip,
    Select,
    HStack,
    Box,
    useColorModeValue,
} from "@chakra-ui/react";
import {
    FiChevronUp,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight
} from "react-icons/fi";
import {
    useTable,
    useSortBy,
    usePagination
} from "react-table";

export function AdvancedTable({ columns, data }) {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 10 },
        },
        useSortBy,
        usePagination
    );

    const bgColor = useColorModeValue("gray.50", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    return (
        <Box border="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
            <TableContainer>
                <Table {...getTableProps()} size="md">
                    <Thead bg={bgColor}>
                        {headerGroups.map((headerGroup) => (
                            <Tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map((column) => (
                                    <Th
                                        {...column.getHeaderProps(column.getSortByToggleProps())}
                                        isNumeric={column.isNumeric}
                                    >
                                        <Flex align="center">
                                            {column.render("Header")}
                                            {column.canSort && (
                                                <Box as="span" ml={2}>
                                                    {column.isSorted ? (
                                                        column.isSortedDesc ? (
                                                            <FiChevronDown size={16} />
                                                        ) : (
                                                            <FiChevronUp size={16} />
                                                        )
                                                    ) : (
                                                        <FiChevronUp size={16} opacity={0.3} />
                                                    )}
                                                </Box>
                                            )}
                                        </Flex>
                                    </Th>
                                ))}
                            </Tr>
                        ))}
                    </Thead>
                    <Tbody {...getTableBodyProps()}>
                        {page.map((row) => {
                            prepareRow(row);
                            return (
                                <Tr {...row.getRowProps()} _hover={{ bg: bgColor }}>
                                    {row.cells.map((cell) => (
                                        <Td
                                            {...cell.getCellProps()}
                                            isNumeric={cell.column.isNumeric}
                                        >
                                            {cell.render("Cell")}
                                        </Td>
                                    ))}
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <Flex justify="space-between" align="center" mt={4}>
                <HStack spacing={2}>
                    <Tooltip label="First Page">
                        <IconButton
                            icon={<FiChevronLeft size={16} />}
                            onClick={() => gotoPage(0)}
                            isDisabled={!canPreviousPage}
                            aria-label="First page"
                        />
                    </Tooltip>
                    <IconButton
                        icon={<FiChevronLeft size={16} />}
                        onClick={() => previousPage()}
                        isDisabled={!canPreviousPage}
                        aria-label="Previous page"
                    />
                    <IconButton
                        icon={<FiChevronRight size={16} />}
                        onClick={() => nextPage()}
                        isDisabled={!canNextPage}
                        aria-label="Next page"
                    />
                    <Tooltip label="Last Page">
                        <IconButton
                            icon={<FiChevronRight size={16} />}
                            onClick={() => gotoPage(pageCount - 1)}
                            isDisabled={!canNextPage}
                            aria-label="Last page"
                        />
                    </Tooltip>
                </HStack>

                <Text>
                    Page{" "}
                    <Text as="span" fontWeight="bold">
                        {pageIndex + 1} of {pageOptions.length}
                    </Text>
                </Text>

                <Select
                    w={32}
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                    }}
                >
                    {[5, 10, 20, 30, 40, 50].map((size) => (
                        <option key={size} value={size}>
                            Show {size}
                        </option>
                    ))}
                </Select>
            </Flex>
        </Box>
    );
}