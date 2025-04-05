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
    partners: any;
}