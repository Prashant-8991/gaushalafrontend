export interface DashboardSummary {
    total_cattle: number;
    present_in_gaushala: number;
    not_present_in_gaushala: number;
    milking_cattle: number;
    pregnant_cattle: number;
}

export interface MonthlyMilkPoint {
    month: string; // ISO date string (first day of month)
    liters: number;
}

export interface MonthlyMilkResponse {
    points: MonthlyMilkPoint[];
}

export interface MilkTodayResponse {
    date: string; // ISO date string
    total_liters: number;
}

export interface TopMilkerPoint {
    tag_number: string;
    name: string | null;
    liters: number;
}

export interface TopMilkersResponse {
    items: TopMilkerPoint[];
}

export interface SourceBreakdownPoint {
    acquisition_type: string;
    count: number;
}

export interface SourceBreakdownResponse {
    items: SourceBreakdownPoint[];
}

async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(path, {
        ...init,
        headers: {
            Accept: 'application/json',
            ...(init?.headers ?? {}),
        },
    });

    if (!res.ok) {
        // keep it simple: callers can decide how to surface
        throw new Error(`API ${res.status}: ${await res.text()}`);
    }

    return (await res.json()) as T;
}

export const gaushalaApi = {
    getDashboardSummary(): Promise<DashboardSummary> {
        return apiGet<DashboardSummary>('/api/analytics/summary');
    },

    getMonthlyMilk(months = 12): Promise<MonthlyMilkResponse> {
        return apiGet<MonthlyMilkResponse>(`/api/analytics/milk/monthly?months=${months}`);
    },

    getMilkToday(): Promise<MilkTodayResponse> {
        return apiGet<MilkTodayResponse>('/api/analytics/milk/today');
    },

    getTopMilkers(days = 30, limit = 8): Promise<TopMilkersResponse> {
        return apiGet<TopMilkersResponse>(`/api/analytics/top-milkers?days=${days}&limit=${limit}`);
    },

    getSourceBreakdown(): Promise<SourceBreakdownResponse> {
        return apiGet<SourceBreakdownResponse>('/api/analytics/source-breakdown');
    },
};
