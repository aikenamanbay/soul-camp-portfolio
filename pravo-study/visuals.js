'use strict';

const lessonVisuals = {
 criminal: ['table',
  ['Четыре элемента состава','Элемент|Вопрос для разбора','Объект|Какому охраняемому интересу причинён вред?','Объективная сторона|Что произошло и как?','Субъект|Кто совершил деяние?','Субъективная сторона|Как человек относился к своему деянию?'],
  ['Құрамның төрт элементі','Элемент|Талдауға арналған сұрақ','Объект|Қандай қорғалатын игілікке зиян келді?','Объективтік жақ|Не болды және қалай болды?','Субъект|Әрекетті кім жасады?','Субъективтік жақ|Адам өз әрекетіне қалай қарады?']]
};

function memoryVisual(id, language) {
 if (id === 'theory') return theoryContext(language)+theoryVisuals.map(visual => renderMemoryVisual(visual, language)).join('');
 if (id === 'constitution') return constitutionMemory(language);
 if (id === 'civil') return civilMemory(language);
 if (id === 'duties') return dutiesMemory(language);
 if (id === 'labor') return laborMemory(language);
 if (id === 'safety') return safetyMemory(language);
 if (id === 'family') return familyMemory(language);
 if (id === 'admin') return adminMemory(language);
 if (id === 'criminal') return criminalMemory(language);
 if (id === 'state') return stateMemory(language);
 return renderMemoryVisual(lessonVisuals[id], language);
}

function renderMemoryVisual([type, ru, kk], language) {
 const [title, ...items] = language === 'kk' ? kk : ru;
 let body;
 if (type === 'table') {
  const [header, ...rows] = items.map(row => row.split('|'));
  const hasRowHeadings = rows.length > 1;
  const table = '<table><thead><tr>'+header.map(cell => '<th scope="col">'+cell+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row => '<tr>'+row.map((cell, index) => index === 0 && hasRowHeadings ? '<th scope="row">'+cell+'</th>' : '<td>'+cell+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
  const cards = '<div class="visual-table-cards'+(hasRowHeadings ? ' visual-table-cards-grouped' : '')+'">'+rows.map(row =>
   '<dl class="visual-table-card">'+row.map((cell, index) =>
    '<div><dt>'+header[index]+'</dt><dd>'+cell+'</dd></div>'
   ).join('')+'</dl>'
  ).join('')+'</div>';
  body = table+cards;
 } else {
  const root = type === 'cluster' ? '<div class="visual-root">'+items.shift()+'</div>' : '';
  body = root+'<ol class="visual-nodes">'+items.map(item => {
   const [label, description] = item.split('|');
   return '<li><strong>'+label+'</strong><span>'+description+'</span></li>';
  }).join('')+'</ol>';
 }
 return '<figure class="memory-visual visual-'+type+'"><figcaption>'+title+'</figcaption>'+body+'</figure>';
}
