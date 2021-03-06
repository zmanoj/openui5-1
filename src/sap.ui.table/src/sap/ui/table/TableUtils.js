/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableUtils.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', './library'],
	function(jQuery, Control, library) {
	"use strict";

	// shortcuts
	var SelectionBehavior = library.SelectionBehavior,
		NavigationMode = library.NavigationMode,
		SelectionMode = library.SelectionMode;

	/**
	 * Static collection of utility functions related to the sap.ui.table.Table, ...
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @name sap.ui.table.TableUtils
	 * @private
	 */
	var TableUtils = {

		/*
 		 * Known basic cell types in the table
		 */
		CELLTYPES : {
			DATACELL : "DATACELL", // standard data cell (standard, group or sum)
			COLUMNHEADER : "COLUMNHEADER", // column header
			ROWHEADER : "ROWHEADER", // row header (standard, group or sum)
			COLUMNROWHEADER : "COLUMNROWHEADER" // select all row selector (top left cell)
		},

		/*
		 * Returns whether the table has a row header or not
		 */
		hasRowHeader : function(oTable) {
			return oTable.getSelectionMode() !== SelectionMode.None
					&& oTable.getSelectionBehavior() !== SelectionBehavior.RowOnly;
		},

		/*
		 * Returns whether the no data text is currently shown or not
		 * If true, also CSS class sapUiTableEmpty is set on the table root element.
		 */
		isNoDataVisible : function(oTable) {
			return oTable.getShowNoData() && !oTable._getRowCount()/*!oTable._hasData()*/;
		},

		/*
		 * Returns the text to be displayed as no data message.
		 * If a custom noData control is set null is returned.
		 */
		getNoDataText : function(oTable) {
			var oNoData = oTable.getNoData();
			if (oNoData instanceof Control) {
				return null;
			} else {
				if (typeof oNoData === "string" || oTable.getNoData() instanceof String) {
					return oNoData;
				} else {
					return oTable._oResBundle.getText("TBL_NO_DATA");
				}
			}
		},

		/*
		 * Returns the number of currently visible columns
		 */
		getVisibleColumnCount : function(oTable) {
			return oTable._getVisibleColumnCount();
		},

		/*
		 * Returns the height of the defined row, identified by its row index.
		 * @param {Object} oTable current table object
		 * @param {int} iRowIndex the index of the row which height is needed
		 */
		getRowHeightByIndex : function(oTable, iRowIndex) {
			var iRowHeight = 0;

			if (oTable) {
				var aRows = oTable.getRows();
				if (aRows && aRows.length && iRowIndex > -1 && iRowIndex < aRows.length) {
					var oDomRefs = aRows[iRowIndex].getDomRefs();
					if (oDomRefs) {
						if (oDomRefs.rowScrollPart && oDomRefs.rowFixedPart) {
							iRowHeight = Math.max(oDomRefs.rowScrollPart.clientHeight, oDomRefs.rowFixedPart.clientHeight);
						} else if (!oDomRefs.rowFixedPart) {
							iRowHeight = oDomRefs.rowScrollPart.clientHeight;
						}
					}
				}
			}

			return iRowHeight;
		},

		/*
		 * Checks whether all conditions for pixel-based scrolling (Variable Row Height) are fulfilled.
		 * @param {Object} oTable current table object
		 * @returns {Boolean} true/false if fulfilled
		 */
		isVariableRowHeightEnabled : function(oTable) {
			return oTable._bVariableRowHeightEnabled && oTable.getNavigationMode() === NavigationMode.Scrollbar;
		},

		/*
		 * Returns the logical number of rows
		 * Optionally empty visible rows are added (in case that the number of data
		 * rows is smaller than the number of visible rows)
		 */
		getTotalRowCount : function(oTable, bIncludeEmptyRows) {
			var iRowCount = oTable._getRowCount();
			if (bIncludeEmptyRows) {
				iRowCount = Math.max(iRowCount, oTable.getVisibleRowCount());
			}
			return iRowCount;
		},

		/*
		 * Returns a combined info about the currently focused item (based on the item navigation)
		 */
		getFocusedItemInfo : function(oTable) {
			var oIN = oTable._getItemNavigation();
			if (!oIN) {
				return null;
			}
			return {
				cell: oIN.getFocusedIndex(),
				columnCount: oIN.iColumns,
				cellInRow: oIN.getFocusedIndex() % oIN.iColumns,
				row: Math.floor(oIN.getFocusedIndex() / oIN.iColumns),
				cellCount: oIN.getItemDomRefs().length,
				domRef: oIN.getFocusedDomRef()
			};
		},

		/*
		 * Returns the index of the column (in the array of visible columns (see Table._getVisibleColumns())) of the current focused cell
		 */
		getColumnIndexOfFocusedCell : function(oTable) {
			var oInfo = TableUtils.getFocusedItemInfo(oTable);
			return oInfo.cellInRow - (TableUtils.hasRowHeader(oTable) ? 1 : 0);
		},

		/*
		 * Returns the index of the row (in the rows aggregation) of the current focused cell
		 */
		getRowIndexOfFocusedCell : function(oTable) {
			var oInfo = TableUtils.getFocusedItemInfo(oTable);
			return oInfo.row - oTable._getHeaderRowCount();
		},

		/*
		 * Returns whether the given cell is located in a group header.
		 */
		isInGroupingRow : function(oCellRef) {
			var oInfo = TableUtils.getCellInfo(oCellRef);
			if (oInfo && oInfo.type === TableUtils.CELLTYPES.DATACELL) {
				return oInfo.cell.parent().hasClass("sapUiTableGroupHeader");
			} else if (oInfo && oInfo.type === TableUtils.CELLTYPES.ROWHEADER) {
				return oInfo.cell.hasClass("sapUiTableGroupHeader");
			}
			return false;
		},

		/*
		 * Returns whether the given cell is located in a analytical summary row.
		 */
		isInSumRow : function(oCellRef) {
			var oInfo = TableUtils.getCellInfo(oCellRef);
			if (oInfo && oInfo.type === TableUtils.CELLTYPES.DATACELL) {
				return oInfo.cell.parent().hasClass("sapUiAnalyticalTableSum");
			} else if (oInfo && oInfo.type === TableUtils.CELLTYPES.ROWHEADER) {
				return oInfo.cell.hasClass("sapUiAnalyticalTableSum");
			}
			return false;
		},

		/*
		 * Returns whether column with the given index (in the array of visible columns (see Table._getVisibleColumns()))
		 * is a fixed column.
		 */
		isFixedColumn : function(oTable, iColIdx) {
			return iColIdx < oTable.getFixedColumnCount();
		},

		/*
		 * Returns whether the table has fixed columns.
		 */
		hasFixedColumns : function(oTable) {
			return oTable.getFixedColumnCount() > 0;
		},

		/*
		 * Focus the item with the given index in the item navigation
		 */
		focusItem : function(oTable, iIndex, oEvent) {
			var oIN = oTable._getItemNavigation();
			if (oIN) {
				oIN.focusItem(iIndex, oEvent);
			}
		},

		/*
		 * Returns the cell type and the jQuery wrapper object of the given cell dom ref or
		 * null if the given dom element is not a table cell.
		 * {type: <TYPE>, cell: <$CELL>}
		 * @see TableUtils.CELLTYPES
		 */
		getCellInfo : function(oCellRef) {
			if (!oCellRef) {
				return null;
			}
			var $Cell = jQuery(oCellRef);
			if ($Cell.hasClass("sapUiTableTd")) {
				return {type: TableUtils.CELLTYPES.DATACELL, cell: $Cell};
			} else if ($Cell.hasClass("sapUiTableCol")) {
				return {type: TableUtils.CELLTYPES.COLUMNHEADER, cell: $Cell};
			} else if ($Cell.hasClass("sapUiTableRowHdr")) {
				return {type: TableUtils.CELLTYPES.ROWHEADER, cell: $Cell};
			} else if ($Cell.hasClass("sapUiTableColRowHdr")) {
				return {type: TableUtils.CELLTYPES.COLUMNROWHEADER, cell: $Cell};
			}
			return null;
		},

		/*
		 * Returns the Row, Column and Cell instances for the given row index (in the rows aggregation)
		 * and column index (in the array of visible columns (see Table._getVisibleColumns()).
		 */
		getRowColCell : function(oTable, iRowIdx, iColIdx) {
			var oRow = oTable.getRows()[iRowIdx];
			var oColumn = oTable._getVisibleColumns()[iColIdx];
			var oCell = oRow && oRow.getCells()[iColIdx];

			//TBD: Clarify why this is needed!
			if (oCell && oCell.data("sap-ui-colid") != oColumn.getId()) {
				var aCells = oRow.getCells();
				for (var i = 0; i < aCells.length; i++) {
					if (aCells[i].data("sap-ui-colid") === oColumn.getId()) {
						oCell = aCells[i];
						break;
					}
				}
			}

			return {row: oRow, column: oColumn, cell: oCell};
		}

	};

	return TableUtils;

}, /* bExport= */ true);