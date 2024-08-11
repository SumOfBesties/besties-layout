import { describe, beforeEach, it, expect } from '@jest/globals';
import { ScheduleService } from '../ScheduleService';
import { mockNodecg, replicants } from '../../__mocks__/MockNodecg';
import { mock } from 'jest-mock-extended';
import { OengusClient } from '../../clients/OengusClient';
import { TalentService } from '../TalentService';
import { Schedule } from 'types/schemas';

describe('ScheduleService', () => {
    let scheduleService: ScheduleService;

    beforeEach(() => {
        scheduleService = new ScheduleService(mockNodecg, mock<OengusClient>(), mock<TalentService>());
    });

    describe('mergeNewScheduleItems', () => {
        it('handles newly added schedule items', () => {
            replicants.schedule = {
                items: []
            };

            const result = scheduleService['mergeNewScheduleItems']([
                {
                    id: '',
                    externalId: '123123',
                    type: 'SPEEDRUN'
                }
            ] as Schedule['items']);

            expect(result).toEqual([
                {
                    id: expect.any(String),
                    externalId: '123123',
                    type: 'SPEEDRUN'
                }
            ]);
            expect(result[0].id).not.toEqual('');
        });

        it('handles merging existing schedule items', () => {
            replicants.schedule = {
                items: [
                    {
                        id: '111',
                        externalId: '123123',
                        type: 'SPEEDRUN',
                        title: 'Cool Run!',
                        category: 'any%'
                    }
                ]
            };

            const result = scheduleService['mergeNewScheduleItems']([
                {
                    id: '',
                    externalId: '123123',
                    type: 'SPEEDRUN',
                    title: 'Cool Run!',
                    category: '100%'
                }
            ] as Schedule['items']);

            expect(result).toEqual([
                {
                    id: '111',
                    externalId: '123123',
                    type: 'SPEEDRUN',
                    title: 'Cool Run!',
                    category: '100%'
                }
            ]);
        });

        it('merges commentator and talent ids as expected', () => {
            replicants.schedule = {
                items: [
                    {
                        id: '111',
                        externalId: '123123',
                        type: 'SPEEDRUN',
                        title: 'Cool Run!',
                        commentatorIds: [
                            { id: 'test-comm-1', externalId: null },
                            { id: 'test-comm-2', externalId: '234234' }
                        ]
                    },
                    {
                        id: '222',
                        externalId: '234234',
                        type: 'OTHER',
                        title: 'other item',
                        talentIds: [
                            { id: 'test-comm-3', externalId: null },
                            { id: 'test-comm-4', externalId: '456456' }
                        ]
                    }
                ]
            };

            const result = scheduleService['mergeNewScheduleItems']([
                {
                    id: '111',
                    externalId: '123123',
                    type: 'SPEEDRUN',
                    title: 'Cool Run!',
                    commentatorIds: []
                },
                {
                    id: '222',
                    externalId: '234234',
                    type: 'OTHER',
                    title: 'other item',
                    talentIds: [
                        { id: 'test-comm-4', externalId: '456456' },
                        { id: 'test-comm-6', externalId: '456567' }
                    ]
                }
            ] as Schedule['items']);

            expect(result).toEqual([
                {
                    id: '111',
                    externalId: '123123',
                    type: 'SPEEDRUN',
                    title: 'Cool Run!',
                    commentatorIds: [
                        { id: 'test-comm-1', externalId: null },
                        { id: 'test-comm-2', externalId: '234234' }
                    ]
                },
                {
                    id: '222',
                    externalId: '234234',
                    type: 'OTHER',
                    title: 'other item',
                    talentIds: [
                        { id: 'test-comm-4', externalId: '456456' },
                        { id: 'test-comm-6', externalId: '456567' }
                    ]
                }
            ]);
        });

        it('merges teams when the input schedule splits each player into separate teams', () => {
            replicants.schedule = {
                items: [
                    {
                        id: '111',
                        externalId: '123123',
                        type: 'SPEEDRUN',
                        title: 'Cool Run!',
                        teams: [
                            {
                                id: 'team1',
                                name: 'Team One',
                                playerIds: [
                                    { id: 'p1' },
                                    { id: 'p2' }
                                ]
                            },
                            {
                                id: 'team2',
                                name: 'Team Two',
                                playerIds: [
                                    { id: 'p3' },
                                    { id: 'p4' }
                                ]
                            }
                        ]
                    }
                ]
            };

            const result = scheduleService['mergeNewScheduleItems']([
                {
                    id: '111',
                    externalId: '123123',
                    type: 'SPEEDRUN',
                    title: 'Cool Run!',
                    teams: [
                        {
                            id: '',
                            playerIds: [
                                { id: 'p1' }
                            ]
                        },
                        {
                            id: '',
                            playerIds: [
                                { id: 'p2' }
                            ]
                        },
                        {
                            id: '',
                            playerIds: [
                                { id: 'p3' }
                            ]
                        },
                        {
                            id: '',
                            playerIds: [
                                { id: 'p4' }
                            ]
                        },
                        {
                            id: '',
                            playerIds: [
                                { id: 'p5' }
                            ]
                        }
                    ]
                }
            ] as unknown as Schedule['items']);

            expect(result).toEqual([
                {
                    id: '111',
                    externalId: '123123',
                    type: 'SPEEDRUN',
                    title: 'Cool Run!',
                    teams: [
                        {
                            id: 'team1',
                            name: 'Team One',
                            playerIds: [
                                { id: 'p1' },
                                { id: 'p2' }
                            ]
                        },
                        {
                            id: 'team2',
                            name: 'Team Two',
                            playerIds: [
                                { id: 'p3' },
                                { id: 'p4' }
                            ]
                        },
                        {
                            id: expect.any(String),
                            playerIds: [
                                { id: 'p5' }
                            ]
                        }
                    ]
                }
            ])
        })

        it('merges teams when the input schedule contains teams with additional players', () => {
            replicants.schedule = {
                items: [
                    {
                        id: '111',
                        externalId: '123123',
                        type: 'SPEEDRUN',
                        title: 'Cool Run!',
                        teams: [
                            {
                                id: 'team1',
                                name: 'Team One',
                                playerIds: [
                                    { id: 'p1' },
                                    { id: 'p2' }
                                ]
                            },
                            {
                                id: 'team2',
                                name: 'Team Two',
                                playerIds: [
                                    { id: 'p3' },
                                    { id: 'p4' }
                                ]
                            }
                        ]
                    }
                ]
            };

            const result = scheduleService['mergeNewScheduleItems']([
                {
                    id: '111',
                    externalId: '123123',
                    type: 'SPEEDRUN',
                    title: 'Cool Run!',
                    teams: [
                        {
                            id: '',
                            playerIds: [
                                { id: 'p1' },
                                { id: 'p2' },
                                { id: 'p5' }
                            ]
                        },
                        {
                            id: '',
                            playerIds: [
                                { id: 'p3' },
                                { id: 'p4' }
                            ]
                        }
                    ]
                }
            ] as unknown as Schedule['items']);

            expect(result).toEqual([
                {
                    id: '111',
                    externalId: '123123',
                    type: 'SPEEDRUN',
                    title: 'Cool Run!',
                    teams: [
                        {
                            id: 'team1',
                            name: 'Team One',
                            playerIds: [
                                { id: 'p1' },
                                { id: 'p2' },
                                { id: 'p5' }
                            ]
                        },
                        {
                            id: 'team2',
                            name: 'Team Two',
                            playerIds: [
                                { id: 'p3' },
                                { id: 'p4' }
                            ]
                        }
                    ]
                }
            ])
        })

        it('merges teams when players in the input schedule have switched teams', () => {
            replicants.schedule = {
                items: [
                    {
                        id: '111',
                        externalId: '123123',
                        type: 'SPEEDRUN',
                        title: 'Cool Run!',
                        teams: [
                            {
                                id: 'team1',
                                name: 'Team One',
                                playerIds: [
                                    { id: 'p1' },
                                    { id: 'p2' }
                                ]
                            },
                            {
                                id: 'team2',
                                name: 'Team Two',
                                playerIds: [
                                    { id: 'p3' },
                                    { id: 'p4' }
                                ]
                            }
                        ]
                    }
                ]
            };

            const result = scheduleService['mergeNewScheduleItems']([
                {
                    id: '111',
                    externalId: '123123',
                    type: 'SPEEDRUN',
                    title: 'Cool Run!',
                    teams: [
                        {
                            id: '',
                            playerIds: [
                                { id: 'p1' },
                                { id: 'p3' }
                            ]
                        },
                        {
                            id: '',
                            playerIds: [
                                { id: 'p5' },
                                { id: 'p4' }
                            ]
                        }
                    ]
                }
            ] as unknown as Schedule['items']);

            expect(result).toEqual([
                {
                    id: '111',
                    externalId: '123123',
                    type: 'SPEEDRUN',
                    title: 'Cool Run!',
                    teams: [
                        {
                            id: expect.any(String),
                            playerIds: [
                                { id: 'p1' },
                                { id: 'p3' }
                            ]
                        },
                        {
                            id: 'team2',
                            name: 'Team Two',
                            playerIds: [
                                { id: 'p5' },
                                { id: 'p4' }
                            ]
                        }
                    ]
                }
            ])
        })

        it('allows for team name changes', () => {
            replicants.schedule = {
                items: [
                    {
                        id: '111',
                        externalId: '123123',
                        type: 'SPEEDRUN',
                        title: 'Cool Run!',
                        teams: [
                            {
                                id: 'team1',
                                name: 'Team One',
                                playerIds: [
                                    { id: 'p1' },
                                    { id: 'p2' }
                                ]
                            },
                            {
                                id: 'team2',
                                name: 'Team Two',
                                playerIds: [
                                    { id: 'p3' },
                                    { id: 'p4' }
                                ]
                            }
                        ]
                    }
                ]
            };

            const result = scheduleService['mergeNewScheduleItems']([
                {
                    id: '111',
                    externalId: '123123',
                    type: 'SPEEDRUN',
                    title: 'Cool Run!',
                    teams: [
                        {
                            id: '',
                            name: 'Team the First',
                            playerIds: [
                                { id: 'p1' },
                                { id: 'p3' }
                            ]
                        },
                        {
                            id: '',
                            name: 'Team the Second',
                            playerIds: [
                                { id: 'p4' }
                            ]
                        }
                    ]
                }
            ] as unknown as Schedule['items']);

            expect(result).toEqual([
                {
                    id: '111',
                    externalId: '123123',
                    type: 'SPEEDRUN',
                    title: 'Cool Run!',
                    teams: [
                        {
                            id: expect.any(String),
                            name: 'Team the First',
                            playerIds: [
                                { id: 'p1' },
                                { id: 'p3' }
                            ]
                        },
                        {
                            id: 'team2',
                            name: 'Team the Second',
                            playerIds: [
                                { id: 'p4' }
                            ]
                        }
                    ]
                }
            ])
        });
    });
});
