# Hour Tracking Application for Asociatia Studentilor Informaticieni Ieseni

## Features of this project:

1. **Authentication**: Secure authentication using NextAuth with Google OAuth integration, ensuring proper validations and user authorization.

2. **Department and Project Management**:
   - Manage departments and assign coordinators.
   - Add and manage projects with designated coordinators.

3. **Task Management**:
   - Add, update, and delete tasks for departments and projects.
   - Approve or revoke task statuses.
   - Track hours worked on tasks with real-time updates.

4. **Team Management**:
   - View and manage team members for departments and projects.
   - Add or remove users from teams.

5. **Reports and Analytics**:
   - Generate PDF reports for department activity.
   - View top active members based on hours worked.

6. **User Account Management**:
   - Update user profile information, including department assignments.
   - View account settings and manage user-specific data.

7. **Real-time Updates**:
   - Reflect changes across all relevant pages upon task or team updates.

8. **Responsiveness**:
   - Fully responsive design for seamless usage across desktop, tablet, and mobile devices.

## Technologies Used:

- **Frontend**:
  - Next.js
  - TypeScript
  - React Hook Form
  - TailwindCSS
  - ShadCN
  - Chart.js
  - @react-pdf/renderer

- **Backend**:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose

- **Authentication**:
  - NextAuth with Google OAuth

- **Other Libraries**:
  - Zod for schema validation
  - Radix UI for accessible components
  - UUID for unique identifiers

## Deployment:

The application is deployed on **Vercel** for the frontend and **MongoDB Atlas** for the database.

## Video of the app 

[![Demo Hours app for ASII](https://img.youtube.com/vi/OWyWYJ-fA7A/0.jpg)](https://youtu.be/OWyWYJ-fA7A)