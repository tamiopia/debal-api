const express = require('express')
const router = express.Router()
const User = require('../models/User') // Adjust path as needed

router.get('/user-growth', async (req, res) => {
  try {
    const period = req.query.period || 'yearly' // daily, weekly, monthly, yearly

    // Define the grouping format based on the selected period
    let groupBy
    switch (period) {
      case 'daily':
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
        break
      case 'weekly':
        groupBy = { $isoWeek: "$createdAt" }
        break
      case 'monthly':
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
        break
      case 'yearly':
      default:
        groupBy = { $year: "$createdAt" }
        break
    }

    const result = await User.aggregate([
      {
        $group: {
          _id: groupBy,
          users: {
            $sum: {
              $cond: [{ $eq: ["$role", "user"] }, 1, 0]
            }
          },
          providers: {
            $sum: {
              $cond: [{ $eq: ["$role", "houseprovider"] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          label: "$_id",
          users: 1,
          providers: 1,
          _id: 0
        }
      }
    ])

    res.json(result)
  } catch (err) {
    console.error("Failed to fetch user growth data:", err)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

module.exports = router


module.exports = router
