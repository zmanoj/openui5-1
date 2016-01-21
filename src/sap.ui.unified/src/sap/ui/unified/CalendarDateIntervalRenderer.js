/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './CalendarRenderer'],
	function(jQuery, Renderer, CalendarRenderer) {
	"use strict";


	/**
	 * CalendarDateInterval renderer.
	 * @namespace
	 */
	var CalendarDateIntervalRenderer = Renderer.extend(CalendarRenderer);

	CalendarDateIntervalRenderer.addAttributes = function(oRm, oCal){

		oRm.addClass("sapUiCalInt");
		oRm.addClass("sapUiCalDateInt");
		var iDays = oCal._getDays();

		if (iDays > oCal._iDaysLarge) {
			oRm.addClass("sapUiCalIntLarge");
		}

		if (iDays > oCal._iDaysMonthHead) {
			oRm.addClass("sapUiCalIntHead");
		}

		var sWidth = oCal.getWidth();
		if (sWidth && sWidth != '') {
			oRm.addStyle("width", sWidth);
			oRm.writeStyles();
		}

	};

	return CalendarDateIntervalRenderer;

}, /* bExport= */ true);