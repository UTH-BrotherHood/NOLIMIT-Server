import { checkSchema } from "express-validator";
import { validate } from "~/utils/validation.utils";

export const createGroupValidation = validate(
    checkSchema({
        participants: {
            isArray: {
                errorMessage: 'participants must be an array',
            },
            custom: {
                options: (value) => value.length >= 2,
                errorMessage: 'Group conversation must have at least 2 participants',
            },
        },
        'participants.*': {
            isString: {
                errorMessage: 'Each participant must be a valid user ID',
            },
            notEmpty: {
                errorMessage: 'Each participant ID cannot be empty',
            },
        },
        group_name: {
            isString: {
                errorMessage: 'group_name must be a string',
            },
            notEmpty: {
                errorMessage: 'group_name cannot be empty',
            },
        },
        creator: {
            isString: {
                errorMessage: 'creator must be a string',
            },
            notEmpty: {
                errorMessage: 'creator cannot be empty',
            },
        },
    },
        ['body']
    )
);