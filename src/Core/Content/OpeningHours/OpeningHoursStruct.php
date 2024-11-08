<?php declare(strict_types=1);

namespace MoorlFoundation\Core\Content\OpeningHours;

use Shopware\Core\Framework\Struct\Struct;

class OpeningHoursStruct extends Struct
{
    protected ?array $openingHours;
    protected int $secondsLeft = 0;
    protected ?string $nextTime = null;
    protected \DateTimeImmutable $now;
    protected string $timezone;

    public function __construct(?array $openingHours, string $timezone)
    {
        $this->openingHours = $openingHours;

        $this->timezone = $timezone;

        $this->now = new \DateTimeImmutable('now', new \DateTimeZone($timezone));
    }

    /**
     * @return string|null
     */
    public function getNextTime(): ?string
    {
        return $this->nextTime;
    }

    /**
     * @return array|null
     */
    public function getOpeningHours(): ?array
    {
        return $this->openingHours;
    }

    /**
     * @param array|null $openingHours
     */
    public function setOpeningHours(?array $openingHours): void
    {
        $this->openingHours = $openingHours;
    }

    /**
     * @return bool
     */
    public function isOpen(?string $datetime = null): bool
    {
        if (!$this->openingHours) {
            return false;
        }

        if ($datetime) {
            preg_match('/(\+\d+.\w+)/', $datetime, $matches, PREG_UNMATCHED_AS_NULL);

            if (!empty($matches[1])) {
                $this->now = (new \DateTimeImmutable('now', new \DateTimeZone($this->timezone)))->modify($datetime);
            } else {
                $this->now = new \DateTimeImmutable($datetime, new \DateTimeZone($this->timezone));
            }
        }

        $dayIndex = ($this->now->format('N') - 1); // 0 Monday - 6 Sunday

        if (empty($this->openingHours[$dayIndex])) {
            $this->nextTime = "X";
            return false;
        }

        $day = $this->openingHours[$dayIndex];

        if (empty($day['times'])) {
            $this->nextTime = trim(sprintf(
                "%s %s",
                $this->now->format('D'),
                $day['info'] ?: 'closed'
            ));
            return false;
        }

        foreach ($day['times'] as $time) {
            if (empty($time['from']) || empty($time['until'])) {
                continue;
            }

            $from = $this->now->setTime(
                (int) substr($time['from'], 0, 2),
                (int) substr($time['from'], 3, 2)
            );

            $until = $this->now->setTime(
                (int) substr($time['until'], 0, 2),
                (int) substr($time['until'], 3, 2)
            );

            if (($from < $this->now) && ($this->now < $until)) {
                $this->nextTime = $until->format("H:i");
                $this->secondsLeft = $until->getTimestamp() - $this->now->getTimestamp();

                return true;
            } else if (!$this->secondsLeft) {
                $this->nextTime = $from->format("H:i");
                $this->secondsLeft = $from->getTimestamp() - $this->now->getTimestamp();
            }
        }

        return false;
    }

    /**
     * @return int
     * Returns difference until open or close
     */
    public function getSecondsLeft(): int
    {
        return $this->secondsLeft;
    }

    public function getTimeLeft(): string
    {
        $seconds = $this->secondsLeft;

        $hours = floor($seconds / 3600);
        $mins = floor($seconds / 60 % 60);
        $secs = floor($seconds % 60);

        return sprintf('- %02d:%02d:%02d', $hours, $mins, $secs);
    }
}
