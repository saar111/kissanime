var tooltip = {
    init: function () {
        this.createTooltip();
        this.attachListeners();
    },
    createTooltip: function () {
        var tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.setAttribute('style', 'position: absolute;background-color: rgb(186, 85, 211);box-shadow: 1px 1px 8px black;border-radius: 6%;display: inline-block;z-index: 100;transition: 0.25s;opacity: 0;pointer-events: none;font-weight: 700;padding: 0 4px 0 4px;');

        document.body.appendChild(tooltip);
        this.tooltip = $(tooltip);
        return tooltip;
    },
    attachTooltip: function (e) {
        tooltip.tooltip.empty();
        var tooltipData = tooltip.parseTooltipDataToDivs(this);

        for (var field = 0; field < tooltipData.length; field++) {
            var fieldDiv = document.createElement('div');
            $(fieldDiv).html(tooltipData[field]);
            tooltip.tooltip.append(fieldDiv);
        }
        /*for (var field in tooltipData) {
         if (tooltipData.hasOwnProperty(field)) {
         var fieldDiv = document.createElement('div');
         fieldDiv.className = '';
         $(fieldDiv).html(field + '  ' + tooltipData[field]);

         tooltip.append(fieldDiv);
         }
         }*/

        tooltip.tooltip.css('opacity', '1');
        tooltip.tooltip.css('top', (e.pageY + 19) + 'px');
        tooltip.tooltip.css('left', (e.pageX + 10) + 'px');

        if (this.getAttribute('data-tooltip-placing-y') == 'above-element')
            tooltip.tooltip.css('top', (e.pageY - e.offsetY - 5 - tooltip.tooltip.height()) + 'px');
        if (this.getAttribute('data-tooltip-placing-y') == 'below-element')
            tooltip.tooltip.css('top', (e.pageY + ($(this).height() - e.offsetY) + 5) + 'px');

        tooltip.ensureTooltipPositionQuality(tooltip.tooltip);
    },
    detachTooltip: function () {
        var self = tooltip || this;
        self.tooltip.css('opacity', '0');
    },
    ensureTooltipPositionQuality: function (tooltip) {
        var checkForTop = window.innerHeight - 10;
        var checkForLeft = window.innerWidth - 10;

        if (parseInt(tooltip[0].style.top) + tooltip.height() > checkForTop) {
            tooltip.css('top', (checkForTop - tooltip.height()) + 'px');
        }
        if (parseInt(tooltip[0].style.left) + tooltip.width() > checkForLeft) {
            tooltip.css('left', (checkForLeft - tooltip.width()) + 'px');
        }
    },
    parseTooltipDataToDivs: function (element) {
        function trimStart(string) {
            while (string[0] == ' ')
                string = string.substring(1);

            return string;
        }

        var tooltipData = element.getAttribute('data-tooltip') || '';
        tooltipData = tooltipData.split(',');

        for (var field = 0; field < tooltipData.length; field++) {
            tooltipData[field] = trimStart(tooltipData[field]);
        }

        return tooltipData;
    },
    attachListeners: function () {
        var tooltip = this;
        $('.hover-tooltip').hover(this.attachTooltip, this.detachTooltip);
        $(window).resize(function () {
            tooltip.ensureTooltipPositionQuality(tooltip.tooltip);
        });
    },
    disbandListeners: function () {
        var tooltip = this;
        $('.hover-tooltip').unbind('mouseenter mouseleave');
        $(window).resize(function () {
            tooltip.ensureTooltipPositionQuality(tooltip.tooltip);
        });
    },
    reload: function () {
        this.disbandListeners();
        this.attachListeners();
    }
};

