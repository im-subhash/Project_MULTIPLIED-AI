export const processData = (rawData) => {
    if (!rawData || !Array.isArray(rawData)) {
        return {
            kpis: {
                totalIncidents: 0,
                highRiskCount: 0,
                uniqueLocations: 0
            },
            charts: {
                severity: [],
                location: [],
                timeline: [],
                type: []
            }
        };
    }

    let highRiskCount = 0;
    const locationsSet = new Set();

    const severityMap = {};
    const locationMap = {};
    const typeMap = {};
    const timelineMap = {};

    rawData.forEach(item => {
        // 1. Defensive Coding & Normalization
        const severity = item.severity_level ?? item.Severity ?? item.severity ?? 0; // Default 0
        // Interpret severity > 2 as High/Critical based on 0-4 scale from inspection
        if (Number(severity) >= 3) {
            highRiskCount++;
        }

        const location = (item.location || item.Location || 'Unknown').trim();
        if (location && location.toLowerCase() !== 'unknown') {
            locationsSet.add(location);
        }

        const type = (item.primary_category || item.Primary_Category || item.category || 'Unspecified').trim();

        // Date Parsing
        let dateObj = null;
        const dateVal = item.incident_date || item.Date;
        if (dateVal) {
            dateObj = new Date(Number(dateVal) || dateVal); // Handle timestamp or string
        }

        // 2. Aggregations

        // Severity Chart
        // Mapping numeric severity to labels if possible, or keeping as number
        const severityLabel = `Level ${severity}`;
        severityMap[severityLabel] = (severityMap[severityLabel] || 0) + 1;

        // Location Chart
        if (location !== 'Unknown') {
            locationMap[location] = (locationMap[location] || 0) + 1;
        }

        // Type Chart
        if (type !== 'Unspecified' && type !== '') {
            typeMap[type] = (typeMap[type] || 0) + 1;
        }

        // Trend Chart
        if (dateObj && !isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const key = `${year}-${month}`;
            timelineMap[key] = (timelineMap[key] || 0) + 1;
        }
    });

    // 3. Formatting for Recharts

    // Severity: Convert map to array
    const severityChart = Object.keys(severityMap).map(key => ({
        name: key,
        value: severityMap[key]
    })).sort((a, b) => b.value - a.value); // Optional: Sort by count

    // Location: Top 10
    const locationChart = Object.keys(locationMap)
        .map(key => ({ name: key, value: locationMap[key] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    // Type: Top 5
    const typeChart = Object.keys(typeMap)
        .map(key => ({ name: key, value: typeMap[key] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Timeline: Sort Chronologically
    const timelineChart = Object.keys(timelineMap)
        .sort() // YYYY-MM sorts naturally string-wise
        .map(key => ({
            name: key,
            value: timelineMap[key]
        }));

    return {
        kpis: {
            totalIncidents: rawData.length,
            highRiskCount,
            uniqueLocations: locationsSet.size
        },
        charts: {
            severity: severityChart,
            location: locationChart,
            timeline: timelineChart,
            type: typeChart
        }
    };
};
