import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsEnum, IsOptional } from "class-validator";
import { UserRole } from "../schema/users.schema";


export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    @Matches(/(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{6,}/, {
        message: 'Password too weak. Must contain at least one letter, one number and one special character.',
      })
    password: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

}