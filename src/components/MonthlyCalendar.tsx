import React, { useMemo } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { getChileanHolidays, isChileanHoliday } from "@/utils/chileanHolidays";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MonthlyCalendar: React.FC = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const holidays = useMemo(() => getChileanHolidays(currentYear), [currentYear]);

  // Obtener todas las fechas de feriados del mes actual
  const holidayDates = useMemo(() => {
    return holidays
      .filter((h) => h.date.getMonth() === currentMonth)
      .map((h) => h.date);
  }, [holidays, currentMonth]);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <CalendarIcon className="w-5 h-5" />
        {today.toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
      </h3>
      
      <Calendar
        mode="single"
        month={today}
        locale={es}
        weekStartsOn={1}
        showOutsideDays={false}
        className="w-full pointer-events-auto"
        classNames={{
          months: "flex flex-col w-full",
          month: "space-y-4 w-full",
          caption: "hidden",
          table: "w-full border-collapse",
          head_row: "flex w-full",
          head_cell: "text-white/70 rounded-md flex-1 font-medium text-sm text-center",
          row: "flex w-full mt-2",
          cell: "flex-1 text-center text-sm p-0 relative",
          day: "h-10 w-full rounded-lg font-medium transition-all duration-200 hover:bg-white/20 text-white",
          day_selected: "bg-transparent text-white",
          day_today: "bg-cyan-500 text-white font-bold ring-2 ring-cyan-300 shadow-lg shadow-cyan-500/50",
          day_outside: "text-white/30",
          day_disabled: "text-white/30",
          day_hidden: "invisible",
        }}
        modifiers={{
          holiday: holidayDates,
        }}
        modifiersClassNames={{
          holiday: "bg-red-500/60 text-white hover:bg-red-500/80",
        }}
        components={{
          Day: ({ date, ...props }) => {
            const holiday = isChileanHoliday(date, holidays);
            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();
            
            const isCurrentMonth = date.getMonth() === currentMonth;
            
            if (!isCurrentMonth) {
              return null;
            }

            const dayClasses = `
              h-10 w-full rounded-lg font-medium transition-all duration-200 
              flex items-center justify-center
              ${isToday 
                ? "bg-cyan-500 text-white font-bold ring-2 ring-cyan-300 shadow-lg shadow-cyan-500/50" 
                : holiday 
                  ? "bg-red-500/60 text-white hover:bg-red-500/80" 
                  : "text-white hover:bg-white/20"
              }
            `;

            if (holiday) {
              return (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className={dayClasses}>
                      {date.getDate()}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 text-white border-gray-700">
                    <p className="font-medium">{holiday.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <button className={dayClasses}>
                {date.getDate()}
              </button>
            );
          },
        }}
      />
    </div>
  );
};

export default MonthlyCalendar;
