![1754484727456](image/README/1754484727456.png)![1754484729354](image/README/1754484729354.png)![1754484730059](image/README/1754484730059.png)![1754484730241](image/README/1754484730241.png)![1754484735616](image/README/1754484735616.png)
# Shift Scheduler

A comprehensive web application for managing team shifts, office seating arrangements, and leave management.

## Features

### 🎯 Core Functionality
- **Shift Management**: Generate and manage shift schedules for teams with customizable patterns
- **Team Management**: Organize team members with different roles (Leads, Associates, Team Leads)
- **Office Seating**: Manage WFO/WFH patterns and office seating arrangements
- **Leave Management**: Integrated calendar-based leave management system
- **Reports & Export**: Export schedules to Excel with color-coded formatting

### 🏢 Team Structure
- **Total Team Members**: 15
- **Leads (5)**: Must be present in all shifts (S1, S2, S3)
- **Associates (8)**: Available for all shifts with flexible scheduling
- **Team Leads (2)**: S2 shift only with automatic weekend offs

### ⏰ Shift Patterns
- **Monday-Friday**: S1(3), S2(2), S3(3)
- **Saturday**: S1(2), S2(2), S3(2)
- **Sunday**: S2(2), S3(2) only

### 🏠 WFO/WFH Rules
- 3 consecutive days WFO, 2 days WFH per week
- Minimum 2 members in office per shift
- 8 office seats available
- No alternate WFO patterns allowed

### 🎨 Color Coding
- **OFF**: Grey
- **LEAVE**: Light Grey
- **WFO**: Green
- **WFH**: Cyan

## Technology Stack

- **Frontend**: React 18, TypeScript
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React hooks
- **Excel Export**: xlsx library
- **Icons**: Lucide React
- **Notifications**: Sonner

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shift-scheduler
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Usage

### Getting Started
1. Navigate to the **Schedule** tab to generate shift schedules
2. Use **Team** tab to manage team members and office seating
3. Access **Calendar & Leaves** for leave management
4. View **Reports** for export history and download schedules

### Generating Schedules
1. Select the desired month and year
2. Click "Generate Schedule" to create the shift roster
3. Use "Export Excel" to download the schedule with color formatting
4. All exports are automatically saved to the Reports section

### Managing Leaves
1. Go to Calendar & Leaves tab
2. Select a team member from the dropdown
3. Choose the leave dates using the date picker
4. Approved leaves will be reflected in generated schedules

### Office Management
1. View current seating arrangements in the Team tab
2. Monitor WFO/WFH patterns and compliance
3. Ensure minimum office occupancy requirements are met

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── ShiftScheduler.tsx
│   ├── TeamManagement.tsx
│   ├── ShiftCalendar.tsx
│   └── Reports.tsx
├── pages/
│   └── Index.tsx        # Main application
├── lib/
│   └── utils.ts         # Utility functions
└── App.tsx              # Application root
```

## Key Features Explained

### Intelligent Scheduling
- Automatic lead assignment to ensure coverage
- Weekend off management with consecutive day limits
- Integration with leave management system
- WFO/WFH pattern enforcement

### Export Functionality
- Color-coded Excel exports
- Automatic filename generation
- Export history tracking
- Downloadable and viewable reports

### Responsive Design
- Mobile-friendly interface
- Smooth animations and transitions
- Modern UI with gradient backgrounds
- Accessible design patterns

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## Development Notes

### Team Member Roles
- **Leads**: Jeyakaran, Karthikeyan, Manoj, Panner, SaiKumar
- **Team Leads**: Dinesh, Mano (S2 only, weekends off)
- **Associates**: Sai Krishna, Jeeva, Saran, Akshay, Murugan, Sahana P, Rengadurai

### Scheduling Rules
- One lead must be present in every shift
- Week offs after 4-6 consecutive working days
- Week offs limited to monthly weekend count
- Team leads have fixed weekend offs
- Leave integration overrides shift assignments

## Watermark
The application includes a subtle "Jeeva's Vibe" watermark that doesn't interfere with functionality.

## License

This project is proprietary software developed for internal team management.

---

*Built with ❤️ for efficient team management*
