// src/app/models/usuario.model.ts
export interface Usuario {
    _id?: string;
    nombres: string;
    apellidos: string;
    email: string;
    cell: string;
    password?: string;
    isVerified?: boolean;
    emailToken?: string;
    createdAt?: Date;
  }