import { checkSchema } from "express-validator";
import { validate } from "~/utils/validation.utils";

export const addParticipantValidation = validate(
    checkSchema({
        reference_id: {
            isString: {
                errorMessage: 'reference_id must be a string',
            },
            notEmpty: {
                errorMessage: 'reference_id cannot be empty',
            },
        },
        type: {
            isString: {
                errorMessage: 'type must be a string',
            },
            notEmpty: {
                errorMessage: 'type cannot be empty',
            },
            isIn: {
                options: [['conversation', 'group']],
                errorMessage: 'type must be conversation or group',
            },
        },
        user_ids: {
            isArray: {
                errorMessage: 'user_ids must be an array',
            },
            custom: {
                options: (value) => value.every((id: any) => typeof id === 'string'),
                errorMessage: 'Each user_id must be a string',
            },
            notEmpty: {
                errorMessage: 'user_ids cannot be empty',
            },
        },
    }, ['body'])
);
