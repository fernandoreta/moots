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
    activeSlots: number;
    totalSlots: number
    superuser?: string;
    background?: string;
}

export interface IPartnerData {
    stamps: number;
    rewards: IReward[];
}
