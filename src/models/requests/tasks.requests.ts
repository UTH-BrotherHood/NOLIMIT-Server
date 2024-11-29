export interface TaskReqBody {
    task_name: string;
    description?: string;
    status: 'Planning' | 'In Progress' | 'Completed';
    start_date?: Date;
    due_date: Date;
    start_time?: Date;
    end_time?: Date;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    assignees: string[];
}

export interface UpdateTaskReqBody {
    task_name: string;
    description?: string;
    status: 'Planning' | 'In Progress' | 'Completed';
    start_date?: Date;
    due_date: Date;
    start_time?: Date;
    end_time?: Date;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    assignees: string[];
    managerId?: string;
}
