export interface IUserData {
    stamps?: number;
    rewards?: any[];
}
  
export interface IPartners {
    partners: {
        [commerceId: string]: IUserData;
    };
}  
export interface IUSer {
    displayName: string;
    email: string;
    createdAt: Date;
    partners?: any;
    partner?: string;
}

export interface IReward {
    name: string;
    claimed: boolean;
    createdAt: string;
}

export interface IAllPartners {
    id: string;
    class: string;
    activeSlots: number;
    totalSlots: number
    superuser?: string;
    background?: string;
}