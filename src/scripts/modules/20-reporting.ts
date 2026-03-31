/* =============================================================================
   PHASE 11: OUTPUT GENERATION
   ============================================================================= */

type ReportingSystemResults = import('../types/pv-types').SystemResults
type ReportingReportMeta = import('../types/pv-types').ReportMeta
type ReportingReportSummary = import('../types/pv-types').ReportSummary
type ReportingReportPayload = import('../types/pv-types').ReportPayload
type ReportingDefenseNotesResult = import('../types/pv-types').DefenseNotesResult

function appendMessages(target: string[], source?: string[]): void {
    if (source && source.length > 0) target.push(...source);
}

const OutputGenerator = {
    generateReport(results: ReportingSystemResults): ReportingReportPayload {
        const meta: ReportingReportMeta = {
            generatedAt: new Date().toISOString(),
            version: '3.0.0'
        };

        const summary: ReportingReportSummary = {
            totalDailyEnergy: results.aggregation.dailyEnergyWh,
            peakLoad: results.aggregation.peakSimultaneousVA,
            inverterSize: results.inverter.recommendedSizeVA,
            batteryCapacity: results.battery.totalCapacityAh,
            pvArraySize: results.pvArray.arrayWattage,
            totalPanels: results.pvArray.totalPanels
        };

        return {
            meta,
            summary,
            details: results,
            warnings: this.collectAllWarnings(results),
            blocks: this.collectAllBlocks(results)
        };
    },

    collectAllWarnings(results: ReportingSystemResults): string[] {
        const warnings: string[] = [];
        appendMessages(warnings, results.aggregation.warnings);
        appendMessages(warnings, results.inverter.warnings);
        appendMessages(warnings, results.battery.warnings);
        appendMessages(warnings, results.pvArray.warnings);
        appendMessages(warnings, results.mpptValidation?.warnings);
        appendMessages(warnings, results.cables?.warnings);
        appendMessages(warnings, results.protection?.warnings);
        appendMessages(warnings, results.decisionStrategy?.warnings);
        appendMessages(warnings, results.supportSummary?.warnings);
        return warnings;
    },

    collectAllBlocks(results: ReportingSystemResults): string[] {
        const blocks: string[] = [];
        appendMessages(blocks, results.inverter.blocks);
        appendMessages(blocks, results.battery.blocks);
        appendMessages(blocks, results.pvArray.blocks);
        appendMessages(blocks, results.mpptValidation?.blocks);
        appendMessages(blocks, results.cables?.blocks);
        return blocks;
    },

    collectAllSuggestions(results: ReportingSystemResults): string[] {
        const suggestions: string[] = [];
        appendMessages(suggestions, results.inverter.suggestions);
        appendMessages(suggestions, results.battery.suggestions);
        appendMessages(suggestions, results.pvArray.suggestions);
        appendMessages(suggestions, results.mpptValidation?.suggestions);
        appendMessages(suggestions, results.cables?.suggestions);
        appendMessages(suggestions, results.protection?.suggestions);
        appendMessages(suggestions, results.decisionStrategy?.suggestions);
        appendMessages(suggestions, results.supportSummary?.openItems);
        return suggestions;
    }
};

/* =============================================================================
   PHASE 12: DEFENSE NOTES (Hard Blocks Display)
   ============================================================================= */

const DefenseNotes = {
    checkForBlocks(results: ReportingSystemResults): ReportingDefenseNotesResult {
        const blocks = OutputGenerator.collectAllBlocks(results);
        const suggestions = OutputGenerator.collectAllSuggestions(results);

        return {
            hasBlocks: blocks.length > 0,
            blocks,
            suggestions
        };
    }
};
