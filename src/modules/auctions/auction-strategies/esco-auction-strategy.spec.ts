import { ESCOAuctionStrategy } from './esco-auction-strategy';
import { AccessLevel, Auction, Bid, Round, User } from '@prisma/client';
import { CreateInitialBidDto } from '../dtos/CreateInitialBidDto';
import { MakeBidDto } from '../dtos/MakeBidDto';

describe('ESCOAuctionStrategy', () => {
    let strategy: ESCOAuctionStrategy;
    let mockAuction: Auction & { Rounds: Array<Round & { Bids: Array<Bid & { User: User }> }> };
    let initRoundTime: Date;
    let firstRoundTime: Date;
    let secondRoundTime: Date;
    let thirdRoundTime: Date;

    beforeEach(() => {
        const currentTime = new Date();

        initRoundTime = new Date(new Date().setMinutes(currentTime.getMinutes() + 1));
        firstRoundTime = new Date(new Date().setMinutes(currentTime.getMinutes() + 2));
        secondRoundTime = new Date(new Date().setMinutes(currentTime.getMinutes() + 3));
        thirdRoundTime = new Date(new Date().setMinutes(currentTime.getMinutes() + 4));

        const user1RoundsBidsTime = [
            {
                startAt: new Date(
                    new Date(initRoundTime).setSeconds(initRoundTime.getSeconds() + 10),
                ),
                totalUpdatedAt: new Date(
                    new Date(initRoundTime).setSeconds(initRoundTime.getSeconds() + 15),
                ),
                endAt: new Date(
                    new Date(initRoundTime).setSeconds(initRoundTime.getSeconds() + 20),
                ),
            },
            {
                startAt: new Date(
                    new Date(firstRoundTime).setSeconds(firstRoundTime.getSeconds() + 10),
                ),
                totalUpdatedAt: new Date(
                    new Date(firstRoundTime).setSeconds(firstRoundTime.getSeconds() + 15),
                ),
                endAt: new Date(
                    new Date(firstRoundTime).setSeconds(firstRoundTime.getSeconds() + 20),
                ),
            },
            {
                startAt: new Date(
                    new Date(secondRoundTime).setSeconds(secondRoundTime.getSeconds() + 10),
                ),
                totalUpdatedAt: new Date(
                    new Date(secondRoundTime).setSeconds(secondRoundTime.getSeconds() + 15),
                ),
                endAt: new Date(
                    new Date(secondRoundTime).setSeconds(secondRoundTime.getSeconds() + 20),
                ),
            },
            {
                startAt: new Date(
                    new Date(thirdRoundTime).setSeconds(thirdRoundTime.getSeconds() + 10),
                ),
                totalUpdatedAt: new Date(
                    new Date(thirdRoundTime).setSeconds(thirdRoundTime.getSeconds() + 15),
                ),
                endAt: new Date(
                    new Date(thirdRoundTime).setSeconds(thirdRoundTime.getSeconds() + 20),
                ),
            },
        ];

        const user2RoundsBidsTime = [
            {
                startAt: new Date(
                    new Date(initRoundTime).setSeconds(initRoundTime.getSeconds() + 20),
                ),
                totalUpdatedAt: new Date(
                    new Date(initRoundTime).setSeconds(initRoundTime.getSeconds() + 25),
                ),
                endAt: new Date(
                    new Date(initRoundTime).setSeconds(initRoundTime.getSeconds() + 30),
                ),
            },
            {
                startAt: new Date(
                    new Date(firstRoundTime).setSeconds(firstRoundTime.getSeconds() + 20),
                ),
                totalUpdatedAt: new Date(
                    new Date(firstRoundTime).setSeconds(firstRoundTime.getSeconds() + 25),
                ),
                endAt: new Date(
                    new Date(firstRoundTime).setSeconds(firstRoundTime.getSeconds() + 30),
                ),
            },
            {
                startAt: new Date(
                    new Date(secondRoundTime).setSeconds(secondRoundTime.getSeconds() + 20),
                ),
                totalUpdatedAt: new Date(
                    new Date(secondRoundTime).setSeconds(secondRoundTime.getSeconds() + 25),
                ),
                endAt: new Date(
                    new Date(secondRoundTime).setSeconds(secondRoundTime.getSeconds() + 30),
                ),
            },
            {
                startAt: new Date(
                    new Date(thirdRoundTime).setSeconds(thirdRoundTime.getSeconds() + 20),
                ),
                totalUpdatedAt: new Date(
                    new Date(thirdRoundTime).setSeconds(thirdRoundTime.getSeconds() + 25),
                ),
                endAt: new Date(
                    new Date(thirdRoundTime).setSeconds(thirdRoundTime.getSeconds() + 30),
                ),
            },
        ];

        mockAuction = {
            id: '79a27f07-3fdd-47d1-a71f-96bb6d6b1a3b',
            auctionType: 'NON_PRICE_CRITERIA',
            name: 'non price 22',
            cashFlow: BigInt(600000),
            purchaseCode: 'sdfasdf',
            customerName: 'dsafadsf',
            expectedCost: BigInt(1000000),
            decreaseStep: BigInt(10000),
            auctionStartAt: initRoundTime,
            firstRoundStartAt: firstRoundTime,
            timeForRoundInSecs: BigInt(40),
            authorId: '65d53e6e-48b4-40d4-b501-0df9d1d4b6f2',
            Rounds: [
                {
                    id: 'd63be640-9d45-4a2c-b857-78c68797eede',
                    sequenceNumber: 0,
                    auctionId: '79a27f07-3fdd-47d1-a71f-96bb6d6b1a3b',
                    Bids: [
                        {
                            id: 'a6a800ee-6788-4d70-8dc2-54f6d11eda64',
                            roundId: 'd63be640-9d45-4a2c-b857-78c68797eede',
                            sequenceNumber: 0,
                            total: BigInt(1200000),
                            adjustedPrice: null,
                            coefficient: null,
                            years: null,
                            days: null,
                            percent: null,
                            userId: '1c5934d6-f63f-4d3b-bc8a-0b5b927ef0ee',
                            ...user1RoundsBidsTime[0],
                            User: {
                                passwordHash: null,
                                refreshToken: null,
                                id: '1c5934d6-f63f-4d3b-bc8a-0b5b927ef0ee',
                                name: 'ТОВ ДУВК',
                                email: 'part1@gmail.com',
                                accessLevel: AccessLevel.REGULAR,
                            },
                        },
                        {
                            id: 'f1cc8d8a-e266-43ce-b399-0b7d16aad1e8',
                            roundId: 'd63be640-9d45-4a2c-b857-78c68797eede',
                            sequenceNumber: 1,
                            total: BigInt(1000000),
                            adjustedPrice: null,
                            coefficient: null,
                            years: null,
                            days: null,
                            percent: null,
                            userId: '5eb377e5-8c9f-4fda-9996-983014ba0fdd',
                            ...user2RoundsBidsTime[0],
                            User: {
                                passwordHash: null,
                                refreshToken: null,
                                id: '5eb377e5-8c9f-4fda-9996-983014ba0fdd',
                                name: 'ТОВ "БК"Ізобуд"',
                                email: 'part2@gmail.com',
                                accessLevel: AccessLevel.REGULAR,
                            },
                        },
                    ],
                },
                {
                    id: '23e1bfb5-cb4f-4eb4-81fd-ac1f143bb101',
                    sequenceNumber: 1,
                    auctionId: '79a27f07-3fdd-47d1-a71f-96bb6d6b1a3b',
                    Bids: [
                        {
                            id: 'b487c5ea-676f-4e44-a722-e3e6a02cdaab',
                            roundId: '23e1bfb5-cb4f-4eb4-81fd-ac1f143bb101',
                            sequenceNumber: 0,
                            total: BigInt(1200000),
                            adjustedPrice: null,
                            coefficient: null,
                            years: null,
                            days: null,
                            percent: null,
                            userId: '1c5934d6-f63f-4d3b-bc8a-0b5b927ef0ee',
                            ...user1RoundsBidsTime[1],
                            User: {
                                passwordHash: null,
                                refreshToken: null,
                                id: '1c5934d6-f63f-4d3b-bc8a-0b5b927ef0ee',
                                name: 'ТОВ ДУВК',
                                email: 'part1@gmail.com',
                                accessLevel: AccessLevel.REGULAR,
                            },
                        },
                        {
                            id: '999df977-b18e-4849-955f-a917bb17dab6',
                            roundId: '23e1bfb5-cb4f-4eb4-81fd-ac1f143bb101',
                            sequenceNumber: 1,
                            total: BigInt(1000000),
                            adjustedPrice: null,
                            coefficient: null,
                            years: null,
                            days: null,
                            percent: null,
                            userId: '5eb377e5-8c9f-4fda-9996-983014ba0fdd',
                            ...user2RoundsBidsTime[1],
                            User: {
                                passwordHash: null,
                                refreshToken: null,
                                id: '5eb377e5-8c9f-4fda-9996-983014ba0fdd',
                                name: 'ТОВ "БК"Ізобуд"',
                                email: 'part2@gmail.com',
                                accessLevel: AccessLevel.REGULAR,
                            },
                        },
                    ],
                },
                {
                    id: 'd2d06ffe-7e08-45d3-966a-daf4600ee7eb',
                    sequenceNumber: 2,
                    auctionId: '79a27f07-3fdd-47d1-a71f-96bb6d6b1a3b',
                    Bids: [
                        {
                            id: '8cc073e0-1e29-4f38-a531-898e1bc3f648',
                            roundId: 'd2d06ffe-7e08-45d3-966a-daf4600ee7eb',
                            sequenceNumber: 0,
                            total: BigInt(1200000),
                            adjustedPrice: null,
                            coefficient: null,
                            years: null,
                            days: null,
                            percent: null,
                            userId: '5eb377e5-8c9f-4fda-9996-983014ba0fdd',
                            ...user1RoundsBidsTime[2],
                            User: {
                                passwordHash: null,
                                refreshToken: null,
                                id: '5eb377e5-8c9f-4fda-9996-983014ba0fdd',
                                name: 'ТОВ "БК"Ізобуд"',
                                email: 'part2@gmail.com',
                                accessLevel: AccessLevel.REGULAR,
                            },
                        },
                        {
                            id: 'c38e3890-126e-43de-8ed4-ea3654c5983f',
                            roundId: 'd2d06ffe-7e08-45d3-966a-daf4600ee7eb',
                            sequenceNumber: 1,
                            total: BigInt(1000000),
                            adjustedPrice: null,
                            coefficient: null,
                            years: null,
                            days: null,
                            percent: null,
                            userId: '1c5934d6-f63f-4d3b-bc8a-0b5b927ef0ee',
                            ...user2RoundsBidsTime[2],
                            User: {
                                passwordHash: null,
                                refreshToken: null,
                                id: '1c5934d6-f63f-4d3b-bc8a-0b5b927ef0ee',
                                name: 'ТОВ ДУВК',
                                email: 'part1@gmail.com',
                                accessLevel: AccessLevel.REGULAR,
                            },
                        },
                    ],
                },
                {
                    id: '9d56e706-954b-4cdf-b93d-f0da9515ee9a',
                    sequenceNumber: 3,
                    auctionId: '79a27f07-3fdd-47d1-a71f-96bb6d6b1a3b',
                    Bids: [
                        {
                            id: 'e840c572-d9e3-468e-858c-bf1f01289f14',
                            roundId: '9d56e706-954b-4cdf-b93d-f0da9515ee9a',
                            sequenceNumber: 0,
                            total: BigInt(1200000),
                            adjustedPrice: null,
                            coefficient: null,
                            years: null,
                            days: null,
                            percent: null,
                            userId: '1c5934d6-f63f-4d3b-bc8a-0b5b927ef0ee',
                            ...user1RoundsBidsTime[3],
                            User: {
                                passwordHash: null,
                                refreshToken: null,
                                id: '1c5934d6-f63f-4d3b-bc8a-0b5b927ef0ee',
                                name: 'ТОВ ДУВК',
                                email: 'part1@gmail.com',
                                accessLevel: AccessLevel.REGULAR,
                            },
                        },
                        {
                            id: '63ac86fd-031c-4239-a03f-9ce3fedb63d2',
                            roundId: '9d56e706-954b-4cdf-b93d-f0da9515ee9a',
                            sequenceNumber: 1,
                            total: BigInt(1000000),
                            adjustedPrice: null,
                            coefficient: null,
                            years: null,
                            days: null,
                            percent: null,
                            userId: '5eb377e5-8c9f-4fda-9996-983014ba0fdd',
                            ...user2RoundsBidsTime[3],
                            User: {
                                passwordHash: null,
                                refreshToken: null,
                                id: '5eb377e5-8c9f-4fda-9996-983014ba0fdd',
                                name: 'ТОВ "БК"Ізобуд"',
                                email: 'part2@gmail.com',
                                accessLevel: AccessLevel.REGULAR,
                            },
                        },
                    ],
                },
            ],
        };
        strategy = new ESCOAuctionStrategy(mockAuction);
    });
    describe('makeBid', () => {
        test('should process bid and update rounds based on ESCO criteria', async () => {
            const makeBidDto: MakeBidDto = { years: 1, days: 200, percent: 10 };
            const userThatBidding = '1c5934d6-f63f-4d3b-bc8a-0b5b927ef0ee';
            const biddingAt = new Date(
                new Date(thirdRoundTime).setSeconds(thirdRoundTime.getSeconds() + 17),
            );
            const result = await strategy.makeBid(makeBidDto, userThatBidding, biddingAt);
            expect(
                result.some((round) => round.Bids.some((bid) => bid.total === BigInt(817163))),
            ).toBeTruthy();
        });

        test('the smallest bid must be first in next round', async () => {
            const smallBid: MakeBidDto = { years: 0, days: 60, percent: 10 };
            const smallBidUser = '1c5934d6-f63f-4d3b-bc8a-0b5b927ef0ee';

            const biddingSmallAt = new Date(
                new Date(secondRoundTime).setSeconds(secondRoundTime.getSeconds() + 17),
            );

            const result = await strategy.makeBid(smallBid, smallBidUser, biddingSmallAt);

            const firstSequenceNumber = 0;

            expect(
                result[result.length - 1].Bids.some(
                    (bid) =>
                        bid.userId === smallBidUser && bid.sequenceNumber === firstSequenceNumber,
                ),
            ).toBeTruthy();
        });

        test('the biggest bid must be last in next round', async () => {
            const bigBid: MakeBidDto = { years: 15, days: 300, percent: 1 };
            const bigBidUser = '5eb377e5-8c9f-4fda-9996-983014ba0fdd';

            const biddingBigAt = new Date(
                new Date(secondRoundTime).setSeconds(secondRoundTime.getSeconds() + 27),
            );

            const result = await strategy.makeBid(bigBid, bigBidUser, biddingBigAt);

            const lastSequenceNumber = result[result.length - 1].Bids.length - 1;

            expect(
                result[result.length - 1].Bids.some(
                    (bid) => bid.userId === bigBidUser && bid.sequenceNumber === lastSequenceNumber,
                ),
            ).toBeTruthy();
        });
    });

    describe('createInitialBid', () => {
        test('should create initial bid based on ESCO criteria and update rounds', async () => {
            const createBidDto: CreateInitialBidDto = { years: 5, days: 300, percent: 10 };
            const result = await strategy.createInitialBid(createBidDto, 'newUserId');
            expect(
                result.some((round) => round.Bids.some((bid) => bid.total === BigInt(2552843))),
            ).toBeTruthy();
        });

        test('the smallest bid must be first in first round', async () => {
            const smallBid: CreateInitialBidDto = { years: 0, days: 60, percent: 10 };
            const smallBidUser = 'new user id';

            const result = await strategy.createInitialBid(smallBid, smallBidUser);

            const firstSequenceNumber = 0;

            expect(
                result[1].Bids.some(
                    (bid) =>
                        bid.userId === smallBidUser && bid.sequenceNumber === firstSequenceNumber,
                ),
            ).toBeTruthy();
        });

        test('the biggest bid must be last in first round', async () => {
            const bigBid: MakeBidDto = { years: 15, days: 300, percent: 1 };
            const bigBidUser = 'new user id';

            const result = await strategy.createInitialBid(bigBid, bigBidUser);

            const lastSequenceNumber = result[1].Bids.length - 1;

            expect(
                result[1].Bids.some(
                    (bid) => bid.userId === bigBidUser && bid.sequenceNumber === lastSequenceNumber,
                ),
            ).toBeTruthy();
        });
    });

    describe('removeUserFromRounds', () => {
        test('should correctly remove user bids from rounds', async () => {
            const updatedRounds = await strategy.removeUserFromRounds(
                '1c5934d6-f63f-4d3b-bc8a-0b5b927ef0ee',
            );
            expect(
                updatedRounds.every((round) =>
                    round.Bids.every(
                        (bid) => bid.userId !== '1c5934d6-f63f-4d3b-bc8a-0b5b927ef0ee',
                    ),
                ),
            ).toBeTruthy();
        });
    });
});
