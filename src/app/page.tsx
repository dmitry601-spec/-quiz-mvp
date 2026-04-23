"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import s from "./landing.module.css";

const faqs = [
  {
    q: "«Нет времени разбираться с новым инструментом»",
    a: "Первая игра создаётся за 5 минут без инструкции — просто введите тему и нажмите кнопку. Никаких настроек. Если что-то непонятно — напишите нам, ответим за час.",
  },
  {
    q: "«Kahoot и Quizlet бесплатны — зачем платить?»",
    a: "В Kahoot вы сами придумываете каждый вопрос. 15 вопросов — 20–30 минут вашего времени. Здесь AI делает это за вас по вашей теме за 60 секунд. Вы платите не за функцию — вы платите за своё время.",
  },
  {
    q: "«Ученику придётся регистрироваться»",
    a: "Нет. Вы отправляете ссылку — ученик открывает и играет прямо в браузере. Никаких аккаунтов, никаких инструкций для родителей. Работает на любом телефоне.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add(s.visible);
        }),
      { threshold: 0.07 }
    );
    document.querySelectorAll("[data-r]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className={s.page}>

      {/* ─── NAV ─── */}
      <nav className={s.navBar}>
        <a href="#" className={s.logo}>Play<em>Class</em></a>
        <div className={s.navR}>
          <a href="#how" className={s.navA}>Как работает</a>
          <a href="#pricing" className={s.navA}>Цена</a>
          <Link href="/start" className={`${s.btn} ${s.btnBlue}`}>Начать бесплатно</Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className={s.hero}>
        <div className={s.heroIn}>
          <div>
            <div className={`${s.heroTag} ${s.ha} ${s.ha1}`}>
              <span className={s.heroTagDot} />
              AI-конструктор игр для репетиторов
            </div>
            <h1 className={`${s.ha} ${s.ha2}`}>
              Ученики не скучают.<br /><em>Вы не готовитесь</em> часами.
            </h1>
            <p className={`${s.heroSub} ${s.ha} ${s.ha3}`}>
              Опишите тему — AI сгенерирует квиз или игру. Ученик откроет по ссылке, без регистрации, за 60 секунд.
            </p>
            <div className={`${s.heroBtns} ${s.ha} ${s.ha4}`}>
              <Link href="/start" className={`${s.btn} ${s.btnBlue} ${s.btnLg}`}>
                Создать первую игру →
              </Link>
              <a href="#aha" className={`${s.btn} ${s.btnGhost} ${s.btnLg}`} style={{ color: "#010B13" }}>
                Посмотреть пример
              </a>
            </div>
          </div>

          <div className={s.heroCard}>
            <div className={s.hcTop}>
              <div className={s.hcDot} style={{ background: "#ff5f57" }} />
              <div className={s.hcDot} style={{ background: "#febc2e" }} />
              <div className={s.hcDot} style={{ background: "#28c840" }} />
              <span className={s.hcUrl}>playclass.app / create</span>
            </div>
            <div className={s.hcBody}>
              <div className={s.hcInputLabel}>Тема урока</div>
              <div className={s.hcInput}>
                <span>Фотосинтез, 7 класс, базовый</span>
                <div className={s.hcInputCursor} />
              </div>
              <div className={s.hcGen}>
                <div className={s.spin} /> AI генерирует квиз...
              </div>
              <div className={s.hcQ}>Какой газ выделяется при фотосинтезе?</div>
              <div className={s.hcOpts}>
                <div className={s.hcOpt}>Углекислый газ</div>
                <div className={`${s.hcOpt} ${s.hcOptOk}`}>Кислород ✓</div>
                <div className={s.hcOpt}>Азот</div>
                <div className={s.hcOpt}>Водород</div>
              </div>
            </div>
            <div className={s.hcFooter}>
              <span>Q 1 / 8</span>
              <div className={s.hcBar}><div className={s.hcBarFill} /></div>
              <span>15 сек</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STRIP ─── */}
      <div className={s.strip}>
        <div className={s.stripIn}>
          {[
            { n: "5",  l: "минут от темы до готовой игры" },
            { n: "0",  l: "регистраций нужно ученику" },
            { n: "∞",  l: "тем — AI справится с любым предметом" },
          ].map(({ n, l }) => (
            <div key={l} className={s.stripItem}>
              <div className={s.stripN}><em>{n}</em></div>
              <div className={s.stripL}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── AHA ─── */}
      <section className={s.aha} id="aha">
        <div className={s.wrap}>
          <div className={s.eyebrow} data-r>Попробуйте прямо сейчас</div>
          <h2 data-r>Создайте игру за 60 секунд</h2>
          <p className={s.sub} data-r style={{ maxWidth: 440, margin: "0 auto 44px" }}>
            Введите любую тему — посмотрите, что AI сгенерирует.
          </p>
          <div className={s.demo} data-r>
            <input
              type="text"
              className={s.demoInput}
              placeholder="Теорема Пифагора, 8 класс, средний уровень..."
            />
            <Link href="/start" className={s.demoBtn}>Сгенерировать →</Link>
          </div>
          <div className={s.hints} data-r>
            <div className={s.hItem}><span>👁️</span> Откройте на телефоне — глазами ученика</div>
            <div className={s.hItem}><span>✏️</span> Отредактируйте любой вопрос</div>
            <div className={s.hItem}><span>🔗</span> Скопируйте ссылку и отправьте</div>
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section className={s.benefits}>
        <div className={s.wrap}>
          <div className={s.eyebrow} data-r>Что вы получите</div>
          <h2 data-r>Всё, что нужно для живого урока</h2>
          <div className={s.bGrid}>
            {[
              { ic: "🎮", t: "Ученик включается снова", p: "Даже если устал и думает о своём — игровой формат перехватывает внимание. Азарт работает там, где не работают объяснения." },
              { ic: "⭐", t: "Вы выглядите современно", p: "Родители видят интерактивный подход и рассказывают о вас знакомым. Сарафанное радио работает лучше, когда есть что рассказать." },
              { ic: "⚡", t: "Подготовка за 5 минут, не за 30", p: "AI придумывает вопросы по вашей теме вместо вас. Вы тратите вечер на отдых, а не на Google Forms." },
              { ic: "📊", t: "Результаты без проверки вручную", p: "После прохождения вы сразу видите, как ученик справился. Никакой ручной проверки — только статистика." },
            ].map(({ ic, t, p }, i) => (
              <div key={t} className={s.bcard} data-r style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={s.bcardIc}>{ic}</div>
                <h3>{t}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RECOGNIZE ─── */}
      <section className={s.recognize}>
        <div className={s.wrap}>
          <div className={s.eyebrow} data-r>Узнаёте себя?</div>
          <h2 data-r>Хотите иметь очередь<br />из учеников и брать дороже?</h2>
          <div className={s.recGrid}>
            <div data-r>
              <p className={s.sub}>Чтобы репетиторство было основным доходом, а не подработкой в промежутках.</p>
              <div className={s.bigBox}>
                <p><strong>Ваша цель:</strong> иметь очередь из учеников и зарабатывать репетиторством как основной профессией — брать за занятие дороже конкурентов и при этом нравиться ученикам.</p>
              </div>
            </div>
            <div className={s.tList} data-r style={{ transitionDelay: ".1s" }}>
              {[
                "Конкурент уже использует интерактивные инструменты — и родители это замечают",
                "Ученик в середине урока смотрит в окно и отвечает односложно",
                "Хочется геймификации, но нет времени разбираться с новыми сервисами",
                "Подготовка интерактивного задания занимает дольше, чем само занятие",
                "Google Forms — это тест, не игра. Kahoot требует часов настройки.",
              ].map((text) => (
                <div key={text} className={s.tItem}>
                  <div className={s.tDot} />
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW ─── */}
      <section className={s.how} id="how">
        <div className={s.wrap}>
          <div className={s.eyebrow} data-r>Как это работает</div>
          <h2 data-r>Три задачи — один инструмент</h2>
          <div className={s.jGrid}>
            {[
              {
                n: "01",
                t: "Переключить ученика прямо во время урока",
                steps: ["Вводите тему — AI генерирует квиз за 60 секунд", "Выбираете формат: квиз, угадай слово", "Ученик открывает ссылку без регистрации"],
              },
              {
                n: "02",
                t: "Подготовить задание за 3–5 минут",
                steps: ["Описываете тему и уровень сложности", "AI придумывает вопросы вместо вас", "При желании правите любой вопрос вручную"],
              },
              {
                n: "03",
                t: "Выглядеть репетитором, которого рекомендуют",
                steps: ["Ученик проходит игру, а не скучный тест", "Родители видят современный подход", "Вы видите результаты без ручной проверки"],
              },
            ].map(({ n, t, steps }, i) => (
              <div key={n} className={s.jcard} data-r style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={s.jcardHead}>
                  <div className={s.jcardN}>{n}</div>
                  <div className={s.jcardT}>{t}</div>
                </div>
                <div className={s.jcardBody}>
                  {steps.map((step) => (
                    <div key={step} className={s.jstep}>
                      <span className={s.jarr}>→</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OUTCOMES ─── */}
      <section className={s.outcomes}>
        <div className={s.wrap}>
          <div className={s.eyebrow} data-r>К чему вы придёте</div>
          <h2 data-r>Занятия, которые ученики ждут</h2>
          <div className={`${s.outGrid}`}>
            {[
              { ic: "🔥", t: "Ученики просят ещё",     p: "Занятия стали живыми — ученик сам спрашивает «будет ли сегодня игра?»", cls: s.ocDark  },
              { ic: "🕐", t: "Вечера — ваши",          p: "Вы перестали тратить часы на подготовку интерактивных заданий.",        cls: s.ocBlue  },
              { ic: "💪", t: "Уверенность в себе",     p: "Вы один из самых современных репетиторов в нише — и это видно.",        cls: s.ocWhite },
            ].map(({ ic, t, p, cls }, i) => (
              <div key={t} className={`${s.ocard} ${cls}`} data-r style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={s.ocardIc}>{ic}</div>
                <h4>{t}</h4>
                <p>{p}</p>
              </div>
            ))}
          </div>
          <div className={`${s.outGrid} ${s.outGridSecond}`}>
            {[
              { ic: "📈", t: "Очередь из учеников",    p: "Вы выстроили поток и можете выбирать, с кем работать.",                                cls: s.ocWhite },
              { ic: "💰", t: "Цена выше рынка",         p: "Берёте дороже конкурентов — и ученики остаются, потому что ценят качество.",          cls: s.ocBlue  },
              { ic: "🤝", t: "Рекомендации без просьб", p: "Родители сами рассказывают о вас, потому что дети приходят с интересом.",             cls: s.ocDark  },
            ].map(({ ic, t, p, cls }, i) => (
              <div key={t} className={`${s.ocard} ${cls}`} data-r style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={s.ocardIc}>{ic}</div>
                <h4>{t}</h4>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className={s.objsSection}>
        <div className={s.wrapS} style={{ textAlign: "center" }}>
          <div className={s.eyebrow} data-r>Сомнения</div>
          <h2 data-r>Отвечаем честно</h2>
        </div>
        <div className={s.objs} data-r>
          {faqs.map((faq, i) => (
            <div key={i} className={s.obi}>
              <button
                className={s.obq}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{faq.q}</span>
                <span className={`${s.obqCh} ${openFaq === i ? s.obqChOpen : ""}`}>↓</span>
              </button>
              <div className={`${s.oba} ${openFaq === i ? s.obaOpen : ""}`}>
                <div className={s.obaIn}>{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── COMPETITORS ─── */}
      <section className={s.comp}>
        <div className={s.wrap}>
          <div className={s.eyebrow} data-r>Сравнение</div>
          <h2 data-r>Почему другие инструменты<br />не закрывают задачу</h2>
          <p className={s.sub} data-r style={{ maxWidth: 440 }}>Они не плохие. Просто сделаны не для вашей задачи.</p>
          <div className={s.ct} data-r>
            {/* Headers */}
            <div className={s.cc + " " + s.cch}>Критерий</div>
            <div className={s.cc + " " + s.cch + " " + s.cchOurs}>PlayClass</div>
            <div className={s.cc + " " + s.cch}>Kahoot</div>
            <div className={`${s.cc} ${s.cch} ${s.hideM}`}>Quizlet</div>
            <div className={`${s.cc} ${s.cch} ${s.hideM}`}>Google Forms</div>
            {/* Rows */}
            {[
              { f: "AI генерирует вопросы за вас",  vals: ["✓", "✗", "✗", "✗"],         types: ["cy","cn","cn","cn"] },
              { f: "Ученик без регистрации",         vals: ["✓", "PIN-код", "✗", "✓"],   types: ["cy","cp","cn","cy"] },
              { f: "Игровой формат (не тест)",       vals: ["✓", "✓", "Карточки", "✗"],  types: ["cy","cy","cp","cn"] },
              { f: "Готово за 5 минут",              vals: ["✓", "✗", "✗", "Иногда"],    types: ["cy","cn","cn","cp"] },
              { f: "Результаты репетитору",          vals: ["✓", "✓", "✗", "✓"],         types: ["cy","cy","cn","cy"] },
            ].map(({ f, vals, types }) => (
              <>
                <div key={f} className={`${s.cc} ${s.ccf}`}>{f}</div>
                <div className={s.cc}><span className={s[types[0] as keyof typeof s]}>{vals[0]}</span></div>
                <div className={s.cc}><span className={s[types[1] as keyof typeof s]}>{vals[1]}</span></div>
                <div className={`${s.cc} ${s.hideM}`}><span className={s[types[2] as keyof typeof s]}>{vals[2]}</span></div>
                <div className={`${s.cc} ${s.hideM}`}><span className={s[types[3] as keyof typeof s]}>{vals[3]}</span></div>
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className={s.pricing} id="pricing">
        <div className={s.wrap} style={{ textAlign: "center" }}>
          <div className={s.pricingEyebrow} data-r>Цена</div>
          <h2 data-r>Начните сегодня</h2>
          <div className={s.priceCard} data-r>
            <div className={s.priceLabel}>Ежемесячная подписка</div>
            <div className={s.priceRow}>
              <div className={s.priceN}>499</div>
              <div className={s.priceP}>₽ / мес</div>
            </div>
            <div className={s.priceFree}>Первые 7 дней — бесплатно. Отмените в любой момент.</div>
            <ul className={s.priceFeats}>
              <li>Неограниченное создание игр</li>
              <li>AI генерирует вопросы по любой теме</li>
              <li>Ссылка для ученика без регистрации</li>
              <li>Статистика прохождения</li>
            </ul>
            <Link href="/start" className={`${s.btn} ${s.btnBlue} ${s.btnLg}`} style={{ width: "100%", justifyContent: "center" }}>
              Начать бесплатно →
            </Link>
            <div className={s.priceNote}>Один удержанный ученик = 1 000–3 000 ₽ в месяц. Инструмент окупается с первого занятия.</div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className={s.footer}>
        <div className={s.footerLogo}>Play<em>Class</em></div>
        <div className={s.footerCopy}>AI-конструктор игр для репетиторов и учителей</div>
      </footer>

    </div>
  );
}
