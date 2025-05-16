import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    @IsString()
    @IsNotEmpty()
    username: string;

    @Column({ unique: true })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;
        
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @Column({ unique: true })
    email: string;
    
    @IsString()
    @IsNotEmpty()
    @Column()
    password: string;
    
    // @Column({ default: true })
    // role: boolean;
}
