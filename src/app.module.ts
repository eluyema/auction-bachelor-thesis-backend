import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './modules/auth/jwt.strategy';
import { AuctionsModule } from './modules/auctions/auctions.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
        }),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('tokenSecret'),
                signOptions: {
                    expiresIn: configService.get<string>('tokenExpiresIn'),
                },
            }),
        }),
        AuthModule,
        AuctionsModule,
    ],
    providers: [JwtStrategy],
})
export class AppModule {}
