export interface IUSerData {
    displayName: string;
    email: string;
    createdAt: Date;
    isAdmin?: boolean;
    partner?: string;
    partners?: any;
}

export interface IReward {
    name?: string;
    createdAt: string;
    claimed?: boolean;
}

export interface IPartner {
    id: string;
    class: string;
    totalSlots: number
    activeSlots: number;
    superuser?: string;
    background?: string;
    monthPromo?: string;
    reward?: string;
}

export interface IPartnerData {
    stamps: number;
    rewards: IReward[];
}
