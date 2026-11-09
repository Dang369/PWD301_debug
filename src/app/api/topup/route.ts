import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const amount = Number(body?.amount || 0);

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'BAD_REQUEST',
          message: 'Số tiền nạp không hợp lệ (phải > 0)',
        },
        { status: 400 }
      );
    }

    let bonus = 0;
    if (amount >= 1000000) bonus = 600000;
    else if (amount >= 500000) bonus = 200000;
    else if (amount >= 200000) bonus = 50000;

    return NextResponse.json({
      success: true,
      message: `Nạp thành công ${amount.toLocaleString('vi-VN')}đ (+${bonus.toLocaleString('vi-VN')}đ thưởng)`,
      amount,
      bonus,
      total_received: amount + bonus,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'INVALID_JSON',
        message: 'Dữ liệu JSON gửi lên không hợp lệ',
      },
      { status: 400 }
    );
  }
}
