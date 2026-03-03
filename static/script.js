    const messagesEl = document.getElementById('messages');
    const inputEl = document.getElementById('input');
    const sendBtn = document.getElementById('sendBtn');
    const emptyState = document.getElementById('emptyState');

    let isLoading = false;

    function autoResize(el) {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 140) + 'px';
    }

    function handleKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function fillSuggestion(btn) {
        inputEl.value = btn.textContent;
        autoResize(inputEl);
        inputEl.focus();
    }

    function getTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function appendMessage(text, role) {
        if (emptyState && emptyState.parentNode) {
            emptyState.remove();
        }

        const row = document.createElement('div');
        row.className = `msg-row ${role}`;

        const avatarHTML = role === 'ai'
            ? `<div class="avatar ai">✦</div>`
            : `<div class="avatar user">You</div>`;

        row.innerHTML = `
            ${avatarHTML}
            <div>
                <div class="bubble ${role}">${escapeHTML(text)}</div>
                <div class="bubble-time" style="text-align:${role === 'user' ? 'right' : 'left'}">${getTime()}</div>
            </div>
        `;

        messagesEl.appendChild(row);
        scrollBottom();
        return row;
    }

    function appendTyping() {
        if (emptyState && emptyState.parentNode) emptyState.remove();

        const row = document.createElement('div');
        row.className = 'msg-row ai';
        row.id = 'typingRow';
        row.innerHTML = `
            <div class="avatar ai">✦</div>
            <div class="bubble ai typing">
                <span></span><span></span><span></span>
            </div>
        `;
        messagesEl.appendChild(row);
        scrollBottom();
    }

    function removeTyping() {
        const el = document.getElementById('typingRow');
        if (el) el.remove();
    }

    function scrollBottom() {
        messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
    }

    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/\n/g, '<br>');
    }

    async function sendMessage() {
        const text = inputEl.value.trim();
        if (!text || isLoading) return;

        isLoading = true;
        sendBtn.disabled = true;
        inputEl.value = '';
        inputEl.style.height = 'auto';

        appendMessage(text, 'user');
        appendTyping();

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_msg: text })
            });

            if (!res.ok) throw new Error(`Server error: ${res.status}`);

            const data = await res.json();
            removeTyping();

           
            const reply = data.response || data.message || data.reply || data.text || data.answer || JSON.stringify(data);
            appendMessage(reply, 'ai');
        } catch (err) {
            removeTyping();
            appendMessage(`⚠ ${err.message || 'Could not reach the server.'}`, 'ai');
        } finally {
            isLoading = false;
            sendBtn.disabled = false;
            inputEl.focus();
        }
    }
