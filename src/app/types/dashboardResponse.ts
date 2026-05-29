export interface DashboardApiResponse {
    total_cattle: number | null;
    all_cattle_data: number | null;
    total_bull: number | null;
    total_ox: number | null;
    total_female_cattle: number | null;
    total_male_cattle: number | null;
    total_female_calf: number | null;
    total_male_calf: number | null;
    total_milking_cow: number | null;
    total_pregnant_cow: number | null;
    source_breakdown: {
        acquisition_type: string | null;
        total_cattle: number | null;
    }[],
    generation: {
        generation: number;
        total_cattle: number;
    }[],
    top_10_milking_cattle: {
        tag_number: string | null;
        name: string | null;
        generation: number | null;
        total_milk: number | null;
    }[],
    top_10_fit_cattle: {
        tag_number: string | null;
        name: string | null;
        generation: number | null;
        hip_width: string | null;
        total_score: number | null;
    }[],
    month_wise_milk_production: {
        month: string | null;
        total_milk: number | null;
    }[],
    average_milk_by_per_cattle: {
        average_milk_by_per_cattle: number;
    }
}