const { createApp } = Vue;

createApp({
    data() {
        return {
            currentDate: new Date(),
            selectedDate: new Date().toISOString().slice(0, 10),
            todos: JSON.parse(localStorage.getItem('todos') || '{}'),
            newTodo: ''
        }
    },
    computed: {
        currentYearMonth() {
            return this.currentDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });
        },
        calendar() {
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            
            // 取得當月第一天是星期幾（0-6，0是星期日）
            const firstDay = new Date(year, month, 1).getDay();
            // 取得當月共有幾天
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            // 取得上個月的天數
            const daysInPrevMonth = new Date(year, month, 0).getDate();
            
            const weeks = [];
            let currentWeek = [];
            
            // 填充上個月的日期
            for (let i = firstDay - 1; i >= 0; i--) {
                const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
                const dateStr = this.formatDateForStorage(prevDate);
                currentWeek.push({
                    date: dateStr,
                    dayNumber: daysInPrevMonth - i,
                    currentMonth: false,
                    isToday: this.isToday(prevDate)
                });
            }
            
            // 填充當月日期
            for (let day = 1; day <= daysInMonth; day++) {
                const currentDate = new Date(year, month, day);
                const dateStr = this.formatDateForStorage(currentDate);
                currentWeek.push({
                    date: dateStr,
                    dayNumber: day,
                    currentMonth: true,
                    isToday: this.isToday(currentDate)
                });
                
                if (currentWeek.length === 7) {
                    weeks.push(currentWeek);
                    currentWeek = [];
                }
            }
            
            // 填充下個月的日期
            if (currentWeek.length > 0) {
                let nextMonthDay = 1;
                while (currentWeek.length < 7) {
                    const nextDate = new Date(year, month + 1, nextMonthDay);
                    const dateStr = this.formatDateForStorage(nextDate);
                    currentWeek.push({
                        date: dateStr,
                        dayNumber: nextMonthDay,
                        currentMonth: false,
                        isToday: this.isToday(nextDate)
                    });
                    nextMonthDay++;
                }
                weeks.push(currentWeek);
            }
            
            return weeks;
        },
        todosForSelectedDate() {
            return this.todos[this.selectedDate] || [];
        }
    },
    methods: {
        previousMonth() {
            this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
        },
        nextMonth() {
            this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
        },
        isToday(date) {
            const today = new Date();
            return date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
        },
        formatDateForStorage(date) {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        selectDate(date) {
            this.selectedDate = date;
        },
        formatDate(dateString) {
            const [year, month, day] = dateString.split('-');
            const date = new Date(year, parseInt(month) - 1, parseInt(day));
            return date.toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
        },
        hasTodos(date) {
            return this.todos[date] && this.todos[date].length > 0;
        },
        getTodoCount(date) {
            return this.todos[date] ? this.todos[date].length : 0;
        },
        addTodo() {
            if (this.newTodo.trim()) {
                if (!this.todos[this.selectedDate]) {
                    this.todos[this.selectedDate] = [];
                }
                this.todos[this.selectedDate].push({
                    text: this.newTodo.trim(),
                    completed: false
                });
                this.newTodo = '';
                this.saveTodos();
            }
        },
        removeTodo(index) {
            this.todos[this.selectedDate].splice(index, 1);
            if (this.todos[this.selectedDate].length === 0) {
                delete this.todos[this.selectedDate];
            }
            this.saveTodos();
        },
        saveTodos() {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        }
    },
    watch: {
        todos: {
            handler() {
                this.saveTodos();
            },
            deep: true
        }
    }
}).mount('#app');