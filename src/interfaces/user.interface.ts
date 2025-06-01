export interface IUSerData {
    displayName: string;
    email: string;
    createdAt: Date;
    isAdmin?: boolean;
    partner?: string;
    partners?: any;
}

export interface IReward {
    name: string;
    claimed: boolean;
    createdAt: string;
}

export interface IPartner {
    id: string;
    class: string;
    totalSlots: number
    activeSlots: number;
    superuser?: string;
    background?: string;
    monthPromo?: string;
}

export interface IPartnerData {
    stamps: number;
    rewards: IReward[];
}
