/*
 * Simple Date Picker
 * @author Fritz Bester <fritzbester@gmail.com>
 * @version 1.0
 */

/*
    A simple vanilla Javascript Datepicker component. It augments a plain text input and adds a dropdown calendar once clicked on.
    The code was written over a period of 2/3 days. I haven't performed extensive testing yet, but its safe to say it works on IE11/Chrome 80/Firefox 74.
*/

if( typeof SimpleDatePicker === "undefined"){
    var SimpleDatePicker = function(id, options){
        var name = 'Simple Datepicker'

        var el = null
        var format = null
        var delimiter = null

        var wrapper = null
        var popup = null

        var yearHeader = null
        var monthHeader = null
        var daysHeader = null
        
        var nextYearBtn = null
        var prevYearBtn = null

        var nextMonthBtn = null
        var prevMonthBtn = null
        
        const monthNames    = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const dayNamesShort = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

        // Essential state
        var currentDate = null
        var currentYear = null
        var currentMonth = null
        var currentDay = null

        var selectedDate = null
        var selectedYear = null
        var selectedMonth = null
        var selectedDay = null

        var selectedDaysContainer = null
        var selectedMonthText = null;
        var selectedYearText = null;
        
        var init = function(id, options){
            // Validation
            if(!id){ console.log(name + ': Please specify a valid node id'); return null }
            el = document.getElementById(id)
            if (el === null) { console.log(name + ': The id `' + id + '` does not exist'); return null }
            if (el.tagName != "INPUT") { console.log(name + ": Only input elements are supported") }

            // Options: Format & Delimiter
            delimiter = options && options.hasOwnProperty('delimiter') ? options['delimiter'] : '/'
            format = options && options.hasOwnProperty('format') ? options['format'] : 'yyyy/mm/dd'

            // Setup state variables
            setupState()

            // Create wrapper around input element
            wrapper = document.createElement('div')
            wrapper.className = "simpledatepicker"
            el.parentNode.insertBefore(wrapper, el)
            wrapper.appendChild(el)

            // Popup element
            popup = document.createElement('div')
            popup.className = "popup"
            wrapper.appendChild(popup)

            // Year Header
            yearHeader = document.createElement('div')
            yearHeader.className = "yearHeader"
            popup.appendChild(yearHeader)

            // Year Text
            selectedYearText = document.createElement('span')
            selectedYearText.className = "currentYear"
            selectedYearText.innerText = currentYear

            // Year Next and Prev buttons
            nextYearBtn = document.createElement('div')
            nextYearBtn.className = 'btn nextYear'
            nextYearBtn.innerHTML = "<span class='txt'>></span>"

            prevYearBtn = document.createElement('div')
            prevYearBtn.className = 'btn prevYear'
            prevYearBtn.innerHTML = "<span class='txt'><</span>"

            // Add to Year Header
            yearHeader.appendChild(nextYearBtn)
            yearHeader.appendChild(selectedYearText)
            yearHeader.appendChild(prevYearBtn)

            // Add Click handlers for Year buttons
            nextYearBtn.addEventListener('click', gotoNextYear)
            prevYearBtn.addEventListener('click', gotoPrevYear)

            // Month Header
            monthHeader = document.createElement('div')
            monthHeader.className = "monthHeader"
            popup.appendChild(monthHeader)

            // Month Text
            selectedMonthText = document.createElement('span')
            selectedMonthText.className = "currentMonth"
            selectedMonthText.innerText = monthNames[currentMonth]

            // Month Next and Prev buttons
            nextMonthBtn = document.createElement('div')
            nextMonthBtn.className = 'btn nextMonth'
            nextMonthBtn.innerHTML = "<span class='txt'>></span>"

            prevMonthBtn = document.createElement('div')
            prevMonthBtn.className = 'btn prevMonth'
            prevMonthBtn.innerHTML = "<span class='txt'><</span>"

            // Add to Month Header
            monthHeader.appendChild(nextMonthBtn)
            monthHeader.appendChild(selectedMonthText)            
            monthHeader.appendChild(prevMonthBtn)

            // Add Click handlers for Month buttons
            nextMonthBtn.addEventListener('click', gotoNextMonth)
            prevMonthBtn.addEventListener('click', gotoPrevMonth)

            // Days Header
            daysHeader = document.createElement('div')
            daysHeader.className = "daysHeader"

            for(var i = 0; i < dayNamesShort.length; i++){
                var _el = document.createElement('div')
                _el.className = "dayHdr"
                _el.innerHTML = "<span class='txt'>" + dayNamesShort[i] + "</span>"
                daysHeader.appendChild(_el)
            }

            popup.appendChild(daysHeader)

            // add Click event to show popup
            wrapper.addEventListener('click', showPopup)
            document.addEventListener('click', hidePopup)

            // Render days
            selectedDaysContainer = renderCurrentMonthDays()
            popup.appendChild(selectedDaysContainer)

        }

        var setupState = function(){

            var tmpDate = null

            // Today's date
            currentDate = new Date()
            currentYear = currentDate.getFullYear()
            currentMonth = currentDate.getMonth() // 0..11
            currentDay = currentDate.getDate()            

            // User's selected date or today's date if no selection/invalid format
            if(el && el.value){
                tmpDate = stringToDate(el.value, format, delimiter)
                tmpDate = (tmpDate instanceof Date && !isNaN(tmpDate)) ? tmpDate : new Date()
            } else {
                tmpDate = new Date()
            }
            selectedDate = tmpDate

            selectedYear = selectedDate.getFullYear()
            selectedMonth = selectedDate.getMonth() // 0..11
            selectedDay = selectedDate.getDate()

            if(selectedYearText !== null){ selectedYearText.innerText = selectedYear }
            if(selectedMonthText !== null){ selectedMonthText.innerText = monthNames[selectedMonth] }
        }

        var showPopup = function(e){
            if(e){ e.stopPropagation(); e.preventDefault() }

            setupState()

            var newDaysContainer = renderCurrentMonthDays()
            popup.replaceChild(newDaysContainer, selectedDaysContainer)
            selectedDaysContainer = newDaysContainer

            if(popup.className.indexOf('visible') === -1){
                popup.className += " visible"
            }
        }

        var hidePopup = function(e){
            popup.className = "popup"
        }

        var renderCurrentMonthDays = function(){
            var daysContainer = document.createElement('div')
            var prevTotalDays = new Date(selectedYear, selectedMonth, 0).getDate()
            var currTotalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate()
            var firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay()
            var pdTotal = prevTotalDays - firstDayOfMonth
            var cellCount = 42;

            // Previous Month days
            for(var pd = pdTotal+1; pd <= prevTotalDays; pd++){
                var pday = document.createElement('div')
                pday.className = 'btn pm'
                pday.addEventListener('click', setSelectedDateValue)
                pday.innerHTML = "<span class='txt'>" + (pd) + "</span>"
                daysContainer.appendChild(pday)
                cellCount -= 1
            }

            // Current Month Days
            for(var d = 1; d <= currTotalDays; d++){
                var day = document.createElement('div')

                // Highlight current/user date

                day.className = 'btn'

                if( selectedMonth == currentMonth &&
                    selectedYear  == currentYear )
                {
                    day.className += ' cm'
                    if(d == currentDay){ day.className += ' cd' }
                    if(d == selectedDay){ day.className += ' sel' }

                } else {
                    if(d == selectedDay){ day.className += ' sel' }
                }
                
                day.innerHTML = "<span class='txt'>" + (d) + "</span>"
                day.addEventListener('click', setSelectedDateValue)

                daysContainer.appendChild(day)
                cellCount -= 1
            }

            // Next Month Days
            for(var nd = 1; nd <= cellCount; nd++){
                var nday = document.createElement('div')
                nday.className = 'btn nm'
                nday.addEventListener('click', setSelectedDateValue)
                nday.innerHTML = "<span class='txt'>" + (nd) + "</span>";
                daysContainer.appendChild(nday)
            }


            daysContainer.className = "daysContainer"
            return daysContainer
        }

        var setSelectedDateValue = function(e){
            var monthOffset = 0;
            e.stopPropagation()
            e.preventDefault()

            // selectedYear and selectedMonth already set
            selectedDay = parseInt(e.target.innerText)
            
            if(e.target.className.indexOf('pm') !== -1){
                monthOffset = -1;
            } else if(e.target.className.indexOf('nm') !== -1){
                monthOffset = 1;
            }

            el.value = dateToString(new Date(selectedYear, selectedMonth + monthOffset, selectedDay), format, delimiter)
            hidePopup()
        }

        var gotoNextMonth = function(e){
            if(e){ e.stopPropagation(); e.preventDefault() }
            
            selectedDay = null
            selectedMonth += 1
            selectedMonth %= 12

            if(selectedMonth == 0){ gotoNextYear(); }
            selectedMonthText.innerText = monthNames[selectedMonth]

            var newDaysContainer = renderCurrentMonthDays()
            popup.replaceChild(newDaysContainer, selectedDaysContainer)
            selectedDaysContainer = newDaysContainer
        }

        var gotoPrevMonth = function(e){
            if(e){ e.stopPropagation(); e.preventDefault() }
            
            selectedDay = null
            if((selectedMonth - 1 ) < 0){ gotoPrevYear() }

            selectedMonth = ((selectedMonth - 1) < 0) ? 11 : selectedMonth - 1
            selectedMonthText.innerText = monthNames[selectedMonth]

            var newDaysContainer = renderCurrentMonthDays()
            popup.replaceChild(newDaysContainer, selectedDaysContainer)
            selectedDaysContainer = newDaysContainer
        }

        var gotoNextYear = function(e){
            if(e){ e.stopPropagation(); e.preventDefault() }

            selectedDay = null
            selectedYear += 1
            selectedYearText.innerText = selectedYear

            var newDaysContainer = renderCurrentMonthDays()
            popup.replaceChild(newDaysContainer, selectedDaysContainer)
            selectedDaysContainer = newDaysContainer
        }
        
        var gotoPrevYear = function(e){
            if(e){ e.stopPropagation(); e.preventDefault() }
            
            selectedDay = null
            selectedYear -= 1
            selectedYearText.innerText = selectedYear

            var newDaysContainer = renderCurrentMonthDays()
            popup.replaceChild(newDaysContainer, selectedDaysContainer)
            selectedDaysContainer = newDaysContainer
        }        

        var getValue = function(){
            return el.value
        }

        var stringToDate = function(dateString, dateFormat, dateFormatDelimiter)
        {
            var formatLowerCase = dateFormat.toLowerCase()
            var parts = formatLowerCase.split(dateFormatDelimiter)
            var dateItems = dateString.split(dateFormatDelimiter)

            var yearIndex = parts.indexOf("yyyy")
            var monthIndex = parts.indexOf("mm")
            var dayIndex = parts.indexOf("dd")

            var y = parseInt(dateItems[yearIndex])
            var m = parseInt(dateItems[monthIndex])
            var d = parseInt(dateItems[dayIndex])

            var date = new Date(y, m - 1, d, 0, 0, 0)

            return date
        }

        var dateToString = function(date, dateFormat, dateFormatDelimiter)
        {
            var year  = date.getFullYear()
            var month = date.getMonth() + 1
            var day   = date.getDate()
            var formatLower = format.toLowerCase()
            var parts = formatLower.split(delimiter)
            var output = ''

            for(var i = 0; i < parts.length; i++){
                if(parts[i].indexOf('y') !== -1){ output += year.toString() }
                else if(parts[i].indexOf('m') !== -1){ output += ('00' + month.toString()).slice(-parts[i].length) }
                else if(parts[i].indexOf('d') !== -1){ output += ('00' + day.toString()).slice(-parts[i].length) }
                if(i+1 < parts.length){
                    output += dateFormatDelimiter
                }
            }

            return output
        }

        init.call(this, id, options)

        return {
            showPopup: showPopup,
            hidePopup: hidePopup,
            getValue: getValue
        }
    }
}